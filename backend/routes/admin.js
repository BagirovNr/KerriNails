const express = require('express')
const https = require('https')
const { readJson, writeJson } = require('../middleware/storage')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

// ─── Telegram helper (тот же подход, что и в appointments.js) ─────────────────

function escapeMarkdownV2(value) {
	return String(value ?? '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

function telegramRequest(token, payload) {
	const body = JSON.stringify(payload)
	const safeToken = encodeURIComponent(token)
	return new Promise((resolve, reject) => {
		let settled = false
		let req

		const hardTimer = setTimeout(() => {
			if (settled) return
			settled = true
			if (req) req.destroy()
			console.error('⏱️  Telegram admin: таймаут 8с')
			reject(new Error('HARD_TIMEOUT'))
		}, 8000)

		try {
			req = https.request(
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
					let data = ''
					res.on('data', c => {
						data += c
					})
					res.on('end', () => {
						if (settled) return
						settled = true
						clearTimeout(hardTimer)
						try {
							resolve(JSON.parse(data))
						} catch (e) {
							reject(e)
						}
					})
				},
			)
			req.on('error', err => {
				if (settled) return
				settled = true
				clearTimeout(hardTimer)
				reject(err)
			})
			req.write(body)
			req.end()
		} catch (syncErr) {
			if (settled) return
			settled = true
			clearTimeout(hardTimer)
			reject(syncErr)
		}
	})
}

async function sendStatusNotification(appointment, status) {
	const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
	if (!token) return

	// Ищем telegramChatId клиента
	const users = readJson('users.json')
	const clientUser = users.find(u => u.id === appointment.userId)
	const clientChatId = clientUser?.telegramChatId

	// Уведомление администратору всегда идёт на TELEGRAM_CHAT_ID
	const adminChatId = (process.env.TELEGRAM_CHAT_ID || '').trim()

	const e = escapeMarkdownV2
	const serviceText = e(
		(appointment.services || [appointment.service]).join(', '),
	)
	const clientName = e(appointment.userName)

	let clientText = ''
	let adminText = ''

	if (status === 'confirmed') {
		clientText =
			`✅ *Здравствуйте, ${clientName}\\!*\n\n` +
			`Ваша запись подтверждена 🎉\n\n` +
			`💆 *Услуга:* ${serviceText}\n` +
			`📅 *Дата:* ${e(appointment.date)}\n` +
			`⏰ *Время:* ${e(appointment.time)}\n\n` +
			`Ждём вас\\! Если что\\-то изменится — пожалуйста, сообщите заранее 🙏`

		adminText =
			`✅ *Запись подтверждена*\n\n` +
			`👤 ${clientName} · ${e(appointment.date)} ${e(appointment.time)}\n` +
			`💆 ${serviceText}`
	} else if (status === 'completed') {
		clientText =
			`Добрый вечер\\! 💕\n\n` +
			`Как вам ${serviceText}? Уже успели к нему привыкнуть? ✨💅🏻\n\n` +
			`Мне всегда очень интересно узнать ваши впечатления\\. Если всё понравилось, буду безумно благодарна за небольшой отзыв — для меня это лучшая поддержка моего кабинета\\. 🤍\n\n` +
			`👉 [Оставить отзыв на Яндексе](https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true)\n\n` +
			`Спасибо вам за доверие и до новых встреч\\! ✨`

		adminText =
			`✓✓ *Визит завершён*\n\n` +
			`👤 ${clientName} · ${e(appointment.date)} ${e(appointment.time)}\n` +
			`💆 ${serviceText}\n` +
			(clientChatId
				? `📲 Клиенту отправлен запрос отзыва`
				: `⚠️ Telegram клиента не привязан`)
	}

	if (!clientText) return

	// Отправляем клиенту если у него подключён Telegram
	if (clientChatId) {
		try {
			const result = await telegramRequest(token, {
				chat_id: Number(clientChatId),
				text: clientText,
				parse_mode: 'MarkdownV2',
				disable_web_page_preview: false,
			})
			if (result.ok) {
				console.log(
					`✅ Telegram: клиент ${appointment.userName} получил уведомление о "${status}"`,
				)
			} else {
				console.error('❌ Telegram клиент:', JSON.stringify(result))
				// Fallback без разметки
				const plain = clientText
					.replace(/\\([_*[\]()~`>#+\-=|{}.!])/g, '$1')
					.replace(/[*`]/g, '')
					.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
				await telegramRequest(token, {
					chat_id: Number(clientChatId),
					text: plain,
				}).catch(() => {})
			}
		} catch (err) {
			console.error('❌ Telegram клиент: ошибка:', err.code || err.message)
		}
	} else {
		console.log(
			`⚠️  Telegram клиента не привязан для ${appointment.userName} — уведомление не отправлено клиенту`,
		)
	}

	// Уведомление администратору (если chat_id настроен)
	if (adminChatId) {
		try {
			await telegramRequest(token, {
				chat_id: Number(adminChatId),
				text: adminText,
				parse_mode: 'MarkdownV2',
			})
		} catch (err) {
			console.error('❌ Telegram admin уведомление:', err.code || err.message)
		}
	}
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/admin/appointments
router.get('/appointments', adminMiddleware, (req, res) => {
	const appointments = readJson('appointments.json')
	res.json(
		appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
	)
})

// PATCH /api/admin/appointments/:id/status
router.patch('/appointments/:id/status', adminMiddleware, async (req, res) => {
	const { status } = req.body
	const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
	if (!validStatuses.includes(status))
		return res.status(400).json({ error: 'Неверный статус' })

	const appointments = readJson('appointments.json')
	const idx = appointments.findIndex(a => a.id === req.params.id)
	if (idx === -1) return res.status(404).json({ error: 'Запись не найдена' })

	appointments[idx].status = status
	writeJson('appointments.json', appointments)

	// Отправить уведомление клиенту при подтверждении или завершении
	if (status === 'confirmed' || status === 'completed') {
		sendStatusNotification(appointments[idx], status).catch(err => {
			console.error('Telegram статус unhandled:', err.message)
		})
	}

	res.json(appointments[idx])
})

// GET /api/admin/users
router.get('/users', adminMiddleware, (req, res) => {
	const users = readJson('users.json')
	res.json(
		users.map(u => ({
			id: u.id,
			name: u.name,
			email: u.email,
			phone: u.phone,
			role: u.role,
			createdAt: u.createdAt,
		})),
	)
})

// GET /api/admin/stats
router.get('/stats', adminMiddleware, (req, res) => {
	const appointments = readJson('appointments.json')
	const users = readJson('users.json')
	res.json({
		total: appointments.length,
		pending: appointments.filter(a => a.status === 'pending').length,
		confirmed: appointments.filter(a => a.status === 'confirmed').length,
		completed: appointments.filter(a => a.status === 'completed').length,
		cancelled: appointments.filter(a => a.status === 'cancelled').length,
		totalClients: users.filter(u => u.role === 'client').length,
	})
})

module.exports = router
