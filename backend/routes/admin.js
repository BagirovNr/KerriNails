const express = require('express')
const https = require('https')
const prisma = require('../lib/prisma')
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
	const clientUser = await prisma.user.findUnique({
		where: { id: appointment.userId },
	})
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
	} else if (status === 'cancelled') {
		clientText =
			`❌ *Здравствуйте, ${clientName}\\!*\n\n` +
			`Ваша запись отменена мастером\\.\n\n` +
			`💆 *Услуга:* ${serviceText}\n` +
			`📅 *Дата:* ${e(appointment.date)}\n` +
			`⏰ *Время:* ${e(appointment.time)}\n\n` +
			`Если у вас есть вопросы — свяжитесь с нами\\. Будем рады записать вас в другое время 🤍`

		adminText =
			`❌ *Запись отменена (мастером)*\n\n` +
			`👤 ${clientName} · ${e(appointment.date)} ${e(appointment.time)}\n` +
			`💆 ${serviceText}`
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
router.get('/appointments', adminMiddleware, async (req, res) => {
	const appointments = await prisma.appointment.findMany({
		orderBy: { createdAt: 'desc' },
	})
	res.json(appointments)
})

// PATCH /api/admin/appointments/:id/status
router.patch('/appointments/:id/status', adminMiddleware, async (req, res) => {
	const { status } = req.body
	const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
	if (!validStatuses.includes(status))
		return res.status(400).json({ error: 'Неверный статус' })

	const existing = await prisma.appointment.findUnique({
		where: { id: req.params.id },
	})
	if (!existing) return res.status(404).json({ error: 'Запись не найдена' })

	const updated = await prisma.appointment.update({
		where: { id: req.params.id },
		data: { status },
	})

	// Отправить уведомление клиенту при подтверждении или завершении
	if (
		status === 'confirmed' ||
		status === 'completed' ||
		status === 'cancelled'
	) {
		sendStatusNotification(updated, status).catch(err => {
			console.error('Telegram статус unhandled:', err.message)
		})
	}

	res.json(updated)
})

// GET /api/admin/users
router.get('/users', adminMiddleware, async (req, res) => {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			role: true,
			createdAt: true,
		},
	})
	res.json(users)
})

// GET /api/admin/stats
router.get('/stats', adminMiddleware, async (req, res) => {
	const [total, pending, confirmed, completed, cancelled, totalClients] =
		await Promise.all([
			prisma.appointment.count(),
			prisma.appointment.count({ where: { status: 'pending' } }),
			prisma.appointment.count({ where: { status: 'confirmed' } }),
			prisma.appointment.count({ where: { status: 'completed' } }),
			prisma.appointment.count({ where: { status: 'cancelled' } }),
			prisma.user.count({ where: { role: 'client' } }),
		])
	res.json({ total, pending, confirmed, completed, cancelled, totalClients })
})

const ALLOWED_SERVICE_CATEGORIES = ['manicure', 'pedicure', 'design', 'extension', 'care']

function slugify(name) {
	return String(name)
		.toLowerCase()
		.trim()
		.replace(/[^a-zа-яё0-9]+/gi, '-')
		.replace(/^-+|-+$/g, '')
}

function validateServiceBody(body, { partial = false } = {}) {
	const errors = []
	if (!partial || body.name !== undefined) {
		if (!body.name || !String(body.name).trim()) errors.push('Название обязательно')
	}
	if (!partial || body.price !== undefined) {
		const price = Number(body.price)
		if (!Number.isFinite(price) || price < 0) errors.push('Цена должна быть неотрицательным числом')
	}
	if (!partial || body.category !== undefined) {
		if (!ALLOWED_SERVICE_CATEGORIES.includes(body.category)) errors.push('Недопустимая категория')
	}
	return errors
}

// GET /api/admin/services — все услуги, включая скрытые
router.get('/services', adminMiddleware, async (req, res) => {
	const services = await prisma.service.findMany({
		orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
	})
	res.json(services)
})

// POST /api/admin/services — создать услугу
router.post('/services', adminMiddleware, async (req, res) => {
	const errors = validateServiceBody(req.body)
	if (errors.length) return res.status(400).json({ error: errors.join(', ') })

	const { name, price, category, description = '', active = true, order = 0 } = req.body
	let slug = slugify(req.body.slug || name)
	if (!slug) slug = `service-${Date.now()}`

	const existing = await prisma.service.findUnique({ where: { slug } })
	if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`

	const service = await prisma.service.create({
		data: { name, price: Math.round(Number(price)), category, description, active, order, slug },
	})
	res.status(201).json(service)
})

// PATCH /api/admin/services/:id — изменить услугу (цену, название, категорию, статус видимости и т.д.)
router.patch('/services/:id', adminMiddleware, async (req, res) => {
	const errors = validateServiceBody(req.body, { partial: true })
	if (errors.length) return res.status(400).json({ error: errors.join(', ') })

	const existing = await prisma.service.findUnique({ where: { id: req.params.id } })
	if (!existing) return res.status(404).json({ error: 'Услуга не найдена' })

	const data = {}
	if (req.body.name !== undefined) data.name = req.body.name
	if (req.body.price !== undefined) data.price = Math.round(Number(req.body.price))
	if (req.body.category !== undefined) data.category = req.body.category
	if (req.body.description !== undefined) data.description = req.body.description
	if (req.body.active !== undefined) data.active = Boolean(req.body.active)
	if (req.body.order !== undefined) data.order = Number(req.body.order)

	const service = await prisma.service.update({ where: { id: req.params.id }, data })
	res.json(service)
})

// DELETE /api/admin/services/:id
router.delete('/services/:id', adminMiddleware, async (req, res) => {
	const existing = await prisma.service.findUnique({ where: { id: req.params.id } })
	if (!existing) return res.status(404).json({ error: 'Услуга не найдена' })

	await prisma.service.delete({ where: { id: req.params.id } })
	res.json({ ok: true })
})

// ── Портфолио ──────────────────────────────────────────────────────────────

const ALLOWED_PORTFOLIO_CATEGORIES = ['manicure', 'pedicure', 'design', 'extension']
const MAX_IMAGE_BASE64_LENGTH = 8 * 1024 * 1024 // ~6 МБ исходного файла с запасом на base64-накладные расходы

// GET /api/admin/portfolio — все фото (для дашборда)
router.get('/portfolio', adminMiddleware, async (req, res) => {
	const items = await prisma.portfolioItem.findMany({
		orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
	})
	res.json(items)
})

// POST /api/admin/portfolio — загрузить новое фото (imageData — base64 data URI, уже сжатое на фронте)
router.post('/portfolio', adminMiddleware, async (req, res) => {
	const { imageData, description = '', category } = req.body

	if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
		return res.status(400).json({ error: 'Нужно загрузить изображение' })
	}
	if (imageData.length > MAX_IMAGE_BASE64_LENGTH) {
		return res.status(400).json({ error: 'Файл слишком большой' })
	}
	if (!ALLOWED_PORTFOLIO_CATEGORIES.includes(category)) {
		return res.status(400).json({ error: 'Недопустимая категория' })
	}

	const maxOrder = await prisma.portfolioItem.aggregate({ _max: { order: true } })
	const item = await prisma.portfolioItem.create({
		data: { imageData, description, category, order: (maxOrder._max.order ?? 0) + 1 },
	})
	res.status(201).json(item)
})

// PATCH /api/admin/portfolio/:id — изменить описание/категорию (не картинку — для новой картинки проще удалить и загрузить заново)
router.patch('/portfolio/:id', adminMiddleware, async (req, res) => {
	const existing = await prisma.portfolioItem.findUnique({ where: { id: req.params.id } })
	if (!existing) return res.status(404).json({ error: 'Фото не найдено' })

	const data = {}
	if (req.body.description !== undefined) data.description = req.body.description
	if (req.body.category !== undefined) {
		if (!ALLOWED_PORTFOLIO_CATEGORIES.includes(req.body.category)) {
			return res.status(400).json({ error: 'Недопустимая категория' })
		}
		data.category = req.body.category
	}

	const item = await prisma.portfolioItem.update({ where: { id: req.params.id }, data })
	res.json(item)
})

// PATCH /api/admin/portfolio/reorder — сохранить новый порядок разом
// body: { order: [id1, id2, id3, ...] } — новый порядок отображения
router.patch('/portfolio-reorder', adminMiddleware, async (req, res) => {
	const order = req.body.order
	if (!Array.isArray(order) || order.some(id => typeof id !== 'string')) {
		return res.status(400).json({ error: 'Ожидается массив id в новом порядке' })
	}

	await Promise.all(
		order.map((id, index) => prisma.portfolioItem.update({ where: { id }, data: { order: index } })),
	)
	const items = await prisma.portfolioItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
	res.json(items)
})

// DELETE /api/admin/portfolio/:id
router.delete('/portfolio/:id', adminMiddleware, async (req, res) => {
	const existing = await prisma.portfolioItem.findUnique({ where: { id: req.params.id } })
	if (!existing) return res.status(404).json({ error: 'Фото не найдено' })

	await prisma.portfolioItem.delete({ where: { id: req.params.id } })
	res.json({ ok: true })
})

// ── Баннеры ──────────────────────────────────────────────────────────────

// GET /api/admin/banners — все баннеры (включая ещё не начавшиеся/уже закончившиеся)
router.get('/banners', adminMiddleware, async (req, res) => {
	const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } })
	res.json(banners)
})

// POST /api/admin/banners — создать баннер
router.post('/banners', adminMiddleware, async (req, res) => {
	const { text = '', imageData = null, linkUrl = '', startDate, endDate } = req.body

	if (!text.trim() && !imageData) {
		return res.status(400).json({ error: 'Укажите текст баннера или загрузите картинку' })
	}
	if (!startDate || !endDate) {
		return res.status(400).json({ error: 'Укажите дату начала и окончания показа' })
	}
	if (new Date(endDate) < new Date(startDate)) {
		return res.status(400).json({ error: 'Дата окончания раньше даты начала' })
	}

	const banner = await prisma.banner.create({
		data: { text, imageData, linkUrl, startDate: new Date(startDate), endDate: new Date(endDate) },
	})
	res.status(201).json(banner)
})

// PATCH /api/admin/banners/:id — изменить текст/картинку/ссылку/даты показа
router.patch('/banners/:id', adminMiddleware, async (req, res) => {
	const existing = await prisma.banner.findUnique({ where: { id: req.params.id } })
	if (!existing) return res.status(404).json({ error: 'Баннер не найден' })

	const data = {}
	if (req.body.text !== undefined) data.text = req.body.text
	if (req.body.imageData !== undefined) data.imageData = req.body.imageData
	if (req.body.linkUrl !== undefined) data.linkUrl = req.body.linkUrl
	if (req.body.startDate !== undefined) data.startDate = new Date(req.body.startDate)
	if (req.body.endDate !== undefined) data.endDate = new Date(req.body.endDate)

	const nextStart = data.startDate ?? existing.startDate
	const nextEnd = data.endDate ?? existing.endDate
	if (nextEnd < nextStart) {
		return res.status(400).json({ error: 'Дата окончания раньше даты начала' })
	}
	const nextText = data.text ?? existing.text
	const nextImage = data.imageData !== undefined ? data.imageData : existing.imageData
	if (!String(nextText).trim() && !nextImage) {
		return res.status(400).json({ error: 'Укажите текст баннера или загрузите картинку' })
	}

	const banner = await prisma.banner.update({ where: { id: req.params.id }, data })
	res.json(banner)
})

// DELETE /api/admin/banners/:id
router.delete('/banners/:id', adminMiddleware, async (req, res) => {
	const existing = await prisma.banner.findUnique({ where: { id: req.params.id } })
	if (!existing) return res.status(404).json({ error: 'Баннер не найден' })

	await prisma.banner.delete({ where: { id: req.params.id } })
	res.json({ ok: true })
})

module.exports = router
