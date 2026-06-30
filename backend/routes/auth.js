const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { readJson, writeJson } = require('../middleware/storage')
const { JWT_SECRET, authMiddleware } = require('../middleware/auth')

const router = express.Router()

// Хранилище кодов сброса (в памяти, живут 10 минут)
const resetCodes = new Map() // phone -> { code, expires, userId }

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body
  if (!name || !phone || !email || !password)
    return res.status(400).json({ error: 'Заполните все поля' })

  const users = readJson('users.json')
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email уже зарегистрирован' })
  if (users.find(u => u.phone === phone))
    return res.status(400).json({ error: 'Телефон уже зарегистрирован' })

  const hashed = await bcrypt.hash(password, 10)
  const user = {
    id: uuidv4(), name, phone, email,
    password: hashed, role: 'client',
    createdAt: new Date().toISOString()
  }
  users.push(user)
  writeJson('users.json', users)

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET, { expiresIn: '7d' }
  )
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Введите email и пароль' })

  const users = readJson('users.json')
  const user = users.find(u => u.email === email)
  if (!user) return res.status(400).json({ error: 'Неверный email или пароль' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ error: 'Неверный email или пароль' })

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET, { expiresIn: '7d' }
  )
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const users = readJson('users.json')
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role })
})

// ─── Восстановление пароля ──────────────────────────────────────────────────

// POST /api/auth/forgot — запросить код по номеру телефона
router.post('/forgot', async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Укажите номер телефона' })

  const users = readJson('users.json')
  const user = users.find(u => u.phone === phone.trim())

  // Не говорим найден ли номер — безопасность
  if (!user) {
    return res.json({ message: 'Если номер зарегистрирован, код отправлен администратору' })
  }

  // Генерируем 4-значный код
  const code = String(Math.floor(1000 + Math.random() * 9000))
  const expires = Date.now() + 10 * 60 * 1000 // 10 минут

  resetCodes.set(phone.trim(), { code, expires, userId: user.id })

  // Отправляем код администратору в Telegram
  await sendResetCodeToAdmin(user, code).catch(() => {})

  console.log(`🔑 Код сброса для ${phone}: ${code}`) // виден в логах Railway
  res.json({ message: 'Код отправлен. Обратитесь к администратору салона.' })
})

// POST /api/auth/reset — подтвердить код и сменить пароль
router.post('/reset', async (req, res) => {
  const { phone, code, newPassword } = req.body
  if (!phone || !code || !newPassword)
    return res.status(400).json({ error: 'Заполните все поля' })
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Пароль минимум 6 символов' })

  const entry = resetCodes.get(phone.trim())
  if (!entry) return res.status(400).json({ error: 'Код не найден или истёк. Запросите новый.' })
  if (Date.now() > entry.expires) {
    resetCodes.delete(phone.trim())
    return res.status(400).json({ error: 'Код истёк (10 минут). Запросите новый.' })
  }
  if (entry.code !== code.trim()) {
    return res.status(400).json({ error: 'Неверный код' })
  }

  // Меняем пароль
  const users = readJson('users.json')
  const idx = users.findIndex(u => u.id === entry.userId)
  if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' })

  users[idx].password = await bcrypt.hash(newPassword, 10)
  writeJson('users.json', users)
  resetCodes.delete(phone.trim())

  res.json({ message: 'Пароль успешно изменён. Войдите с новым паролем.' })
})

// ─── Telegram helper для кода сброса ───────────────────────────────────────
async function sendResetCodeToAdmin(user, code) {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim()
  if (!token || !chatId) return

  const text =
    `🔑 *Запрос сброса пароля*\n\n` +
    `👤 *Клиент:* ${user.name}\n` +
    `📞 *Телефон:* ${user.phone}\n` +
    `✉️ *Email:* ${user.email}\n\n` +
    `🔢 *Код:* \`${code}\`\n\n` +
    `⏱ Действует 10 минут.\n` +
    `_Передайте код клиенту лично или по телефону._`

  const body = JSON.stringify({ chat_id: Number(chatId), text, parse_mode: 'Markdown' })
  const https = require('https')

  await new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      },
      (res) => { res.resume(); resolve() }
    )
    req.on('error', resolve)
    req.write(body)
    req.end()
  })
}

module.exports = router
