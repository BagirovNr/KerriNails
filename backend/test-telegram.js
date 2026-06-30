// Изолированный тест: проверяет, может ли Node.js на этом компьютере
// достучаться до Telegram API напрямую, в обход всего бэкенда/Express.
//
// Запуск:
//   cd backend
//   node test-telegram.js
//
// Если этот скрипт зависнет / не покажет результат за 8 секунд — проблема
// на уровне ОС/файрвола/антивируса, блокирующего node.exe (curl при этом
// может работать нормально, т.к. это другой процесс).

require('dotenv').config()
const https = require('https')

const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim()

console.log('Токен найден:', token ? `да (${token.slice(0, 10)}...)` : 'НЕТ — проверь .env')
console.log('Chat ID найден:', chatId || 'НЕТ — проверь .env')

if (!token || !chatId) {
  console.log('❌ Останавливаюсь: токен или chat_id не настроены в backend/.env')
  process.exit(1)
}

const body = JSON.stringify({
  chat_id: Number(chatId),
  text: '🧪 Тестовое сообщение напрямую из Node.js (test-telegram.js)'
})

console.log('🔌 Подключаюсь к api.telegram.org...')
const start = Date.now()

const hardTimer = setTimeout(() => {
  console.log(`⏱️  ТАЙМАУТ: за 8 секунд ответа не было.`)
  console.log('   Это значит, что Node.js не может выйти в интернет на этот хост,')
  console.log('   хотя curl у тебя работал. Скорее всего блокирует:')
  console.log('   — антивирус (Kaspersky/Avast/Defender — добавь node.exe в исключения)')
  console.log('   — корпоративный/VPN файрвол')
  console.log('   — Windows Defender Firewall (разреши node.exe исходящие соединения)')
  process.exit(1)
}, 8000)

const req = https.request(
  {
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  },
  (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      clearTimeout(hardTimer)
      const ms = Date.now() - start
      console.log(`📡 Ответ получен за ${ms}мс, статус ${res.statusCode}`)
      console.log(data)
      try {
        const parsed = JSON.parse(data)
        if (parsed.ok) {
          console.log('✅ УСПЕХ! Сообщение отправлено. Node.js может достучаться до Telegram.')
          console.log('   Значит проблема была в самом бэкенде/маршруте — обнови appointments.js из присланного архива.')
        } else {
          console.log('❌ Telegram вернул ошибку:', parsed.description)
        }
      } catch (e) {
        console.log('❌ Не удалось распарсить ответ как JSON')
      }
      process.exit(0)
    })
  }
)

req.on('error', (err) => {
  clearTimeout(hardTimer)
  console.log('❌ ОШИБКА СОКЕТА:', err.code, '-', err.message)
  console.log('   Это явная блокировка на уровне сети/ОС. Проверь антивирус и файрвол.')
  process.exit(1)
})

req.write(body)
req.end()
