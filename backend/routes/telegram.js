// Telegram webhook и привязка chat_id клиента к его аккаунту на сайте.
//
// Как это работает:
// 1. Клиент на сайте нажимает "Подключить Telegram" — открывается ссылка
//    https://t.me/ИМЯ_БОТА?start=USER_ID
// 2. Telegram открывает бота и передаёт ему /start USER_ID
// 3. Наш webhook (POST /api/telegram/webhook) получает это сообщение,
//    извлекает USER_ID и сохраняет telegramChatId в users.json
// 4. Теперь при подтверждении/завершении записи admin.js шлёт уведомление
//    напрямую клиенту, а не только администратору.
//
// Настройка webhook (один раз, после деплоя на Railway):
//   curl "https://api.telegram.org/botТОКЕН/setWebhook?url=https://ДОМЕН/api/telegram/webhook"

const express = require('express')
const https = require('https')
const { readJson, writeJson } = require('../middleware/storage')

const router = express.Router()

// Отправить сообщение в Telegram — вспомогательная функция
function sendMessage(token, chatId, text) {
	const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
	const safeToken = encodeURIComponent(token)
	return new Promise(resolve => {
		try {
			const req = https.request(
				{
					hostname: 'api.telegram.org',
					path: `/bot${safeToken}/sendMessage`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(body),
					},
				},
				res => {
					res.resume()
					resolve()
				},
			)
			req.on('error', resolve)
			req.write(body)
			req.end()
		} catch {
			resolve()
		}
	})
}

// POST /api/telegram/webhook
// Telegram шлёт сюда все входящие сообщения боту.
router.post('/webhook', async (req, res) => {
	// Отвечаем Telegram немедленно — иначе он будет слать повторы
	res.sendStatus(200)

	const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
	if (!token) return

	const message = req.body?.message
	if (!message) return

	const chatId = message.chat?.id
	const text = (message.text || '').trim()

	// Ожидаем команду /start USER_ID
	if (!text.startsWith('/start')) return

	const userId = text.replace('/start', '').trim()

	if (!userId) {
		// Клиент открыл бота без параметра — просто приветствие
		await sendMessage(
			token,
			chatId,
			'👋 Привет! Это бот салона <b>Kerri Nails</b>.\n\nЧтобы получать уведомления о своих записях, нажмите кнопку «Подключить Telegram» в личном кабинете на сайте.',
		)
		return
	}

	// Привязываем chat_id к пользователю
	const users = readJson('users.json')
	const idx = users.findIndex(u => u.id === userId)

	if (idx === -1) {
		await sendMessage(
			token,
			chatId,
			'❌ Ссылка устарела или недействительна. Попробуйте ещё раз через личный кабинет на сайте.',
		)
		return
	}

	const user = users[idx]

	// Уже привязан тот же chat_id — не дублируем
	if (users[idx].telegramChatId === String(chatId)) {
		await sendMessage(
			token,
			chatId,
			`✅ <b>${user.name}</b>, ваш Telegram уже подключён!\n\nВы будете получать уведомления о записях. 💅`,
		)
		return
	}

	users[idx].telegramChatId = String(chatId)
	writeJson('users.json', users)
	console.log(
		`✅ Telegram привязан: пользователь ${user.name} (${user.id}) → chat_id ${chatId}`,
	)

	await sendMessage(
		token,
		chatId,
		`✅ Отлично, <b>${user.name}</b>!\n\nВаш Telegram подключён к салону <b>Kerri Nails</b>. 🎉\n\nТеперь вы будете получать уведомления:\n• 📬 Подтверждение записи\n• ✨ Напоминание после визита\n\nДо встречи! 💅`,
	)
})

// GET /api/telegram/status?userId=XXX
// Фронтенд проверяет, подключён ли Telegram у пользователя.
router.get('/status', (req, res) => {
	const { userId } = req.query
	if (!userId) return res.status(400).json({ connected: false })
	const users = readJson('users.json')
	const user = users.find(u => u.id === userId)
	res.json({ connected: !!user?.telegramChatId })
})

module.exports = router
