const express = require('express')
const prisma = require('../lib/prisma')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// ─── Telegram helper ───────────────────────────────────────────────────────────

// Экранирует спецсимволы MarkdownV2, чтобы Telegram не падал с ошибкой
// парсинга, если в имени/комментарии клиента есть *, _, [, ], (, ), ` и т.д.
function escapeMarkdownV2(value) {
	return String(value ?? '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

async function sendTelegramNotification(appointment) {
	// Самая первая строка функции — если этого лога нет в консоли,
	// значит функция вообще не вызывается (проблема выше по коду,
	// либо запросы обрабатывает другой/старый процесс node).
	console.log(
		'🟢 sendTelegramNotification() вызвана для записи',
		appointment.id,
	)

	const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
	const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim()

	if (!token || !chatId) {
		console.log(
			'⚠️  Telegram: токен или chat_id не настроен (см. backend/.env)',
		)
		return
	}

	const e = escapeMarkdownV2
	const servicesText = (appointment.services || [appointment.service]).join(
		', ',
	)
	const text =
		`💅 *Новая запись\\!*\n\n` +
		`👤 *Клиент:* ${e(appointment.userName)}\n` +
		`📞 *Телефон:* ${e(appointment.userPhone || 'не указан')}\n` +
		`✉️ *Email:* ${e(appointment.userEmail)}\n` +
		`💆 *Услуги:* ${e(servicesText)}\n` +
		`⏱ *Длительность:* ${e(appointment.duration + ' ч.')}\n` +
		`📅 *Дата:* ${e(appointment.date)}\n` +
		`⏰ *Время:* ${e(appointment.time)}\n` +
		(appointment.comment
			? `💬 *Комментарий:* ${e(appointment.comment)}\n`
			: '') +
		`\n🆔 ID: \`${e(appointment.id)}\``

	console.log(`📲 Отправляю Telegram уведомление на chat_id: ${chatId}`)

	try {
		const data = await telegramRequest(token, {
			chat_id: Number(chatId),
			text,
			parse_mode: 'MarkdownV2',
		})

		if (data.ok) {
			console.log('✅ Telegram уведомление отправлено!')
			return
		}

		console.error('❌ Telegram ошибка разметки:', JSON.stringify(data))
		const plain = text
			.replace(/\\([_*[\]()~`>#+\-=|{}.!])/g, '$1')
			.replace(/[*`]/g, '')
		const fallback = await telegramRequest(token, {
			chat_id: Number(chatId),
			text: plain,
		})
		if (fallback.ok) {
			console.log('✅ Telegram уведомление отправлено (fallback без разметки)')
		} else {
			console.error(
				'❌ Telegram fallback не сработал:',
				JSON.stringify(fallback),
			)
		}
	} catch (err) {
		// Не блокируем создание записи, если Telegram недоступен
		console.error(
			'❌ Telegram сетевая/системная ошибка:',
			err.code || err.message,
		)
	}
}

// Делает POST-запрос к Telegram Bot API через встроенный модуль https —
// тот же подход, что в test-telegram.js, который у тебя успешно отработал.
// Сознательно НЕ используем axios/fetch: они по умолчанию подхватывают
// системные переменные окружения HTTP_PROXY/HTTPS_PROXY (их часто
// выставляет VPN/антивирус) и пытаются идти через прокси, из-за чего
// запрос зависает — хотя обычный https.request их игнорирует и идёт
// напрямую к api.telegram.org.
function telegramRequest(token, payload) {
	const https = require('https')
	const body = JSON.stringify(payload)

	return new Promise((resolve, reject) => {
		let settled = false

		const hardTimer = setTimeout(() => {
			if (settled) return
			settled = true
			console.error('⏱️  Telegram: жёсткий таймаут 8с — соединение не отвечает')
			req.destroy()
			reject(new Error('HARD_TIMEOUT'))
		}, 8000)

		const req = https.request(
			{
				hostname: 'api.telegram.org',
				path: `/bot${token}/sendMessage`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(body),
				},
			},
			res => {
				console.log(`📡 Telegram: получен ответ, статус ${res.statusCode}`)
				let data = ''
				res.on('data', chunk => {
					data += chunk
				})
				res.on('end', () => {
					if (settled) return
					settled = true
					clearTimeout(hardTimer)
					try {
						resolve(JSON.parse(data))
					} catch (e) {
						reject(
							new Error(
								`Telegram вернул не-JSON ответ (status ${res.statusCode}): ${data.slice(0, 300)}`,
							),
						)
					}
				})
			},
		)

		req.on('error', err => {
			if (settled) return
			settled = true
			clearTimeout(hardTimer)
			console.error('❌ Telegram: ошибка сокета:', err.code || err.message)
			reject(err)
		})

		req.write(body)
		req.end()
	})
}

// ─── Время и длительность ────────────────────────────────────────────────────

// Рабочий день: слоты только на целый час, с 10:00 до 19:00 (последняя
// запись в 19:00, т.к. салон закрывается в 20:00 максимум при 1-часовой услуге).
const WORK_START_HOUR = 10
const WORK_END_HOUR = 20 // салон закрывается в 20:00

function generateHourSlots() {
	const slots = []
	for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
		slots.push(`${String(h).padStart(2, '0')}:00`)
	}
	return slots
}

function timeToHour(time) {
	return parseInt(String(time).split(':')[0], 10)
}

// 1 услуга = 1 час, 2 услуги (например, маникюр + педикюр) = 2 часа и т.д.
// На случай большого числа услуг ограничиваем 3 часами, чтобы не выйти
// за пределы рабочего дня в один присест.
function calcDuration(services) {
	const count = Array.isArray(services) ? services.length : 1
	return Math.max(1, Math.min(count, 3))
}

// Пересекаются ли два интервала [startA, startA+durA) и [startB, startB+durB)
function rangesOverlap(startA, durA, startB, durB) {
	const endA = startA + durA
	const endB = startB + durB
	return startA < endB && startB < endA
}

// ─── Правило "не позднее 4 часов до начала" ─────────────────────────────────

const MIN_HOURS_BEFORE_CHANGE = 4
const LOCKED_MESSAGE =
	'До начала процедуры осталось менее 4 часов. Изменение или отмена записи недоступны. Свяжитесь с мастером'

// Салон работает по московскому времени (UTC+3, без перехода на летнее).
// Сервер на Railway обычно работает в UTC, поэтому вычисляем момент начала
// записи явно в UTC+3, а не полагаемся на часовой пояс процесса Node —
// иначе 4-часовое правило будет считаться неверно.
const SALON_UTC_OFFSET_HOURS = 3

function hoursUntilAppointment(date, time) {
	const startUtcMs =
		Date.parse(`${date}T${time}:00.000Z`) -
		SALON_UTC_OFFSET_HOURS * 60 * 60 * 1000
	return (startUtcMs - Date.now()) / (1000 * 60 * 60)
}

async function sendRescheduleNotification(appointment) {
	const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
	const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim()
	if (!token || !chatId) return

	const e = escapeMarkdownV2
	const servicesText = (appointment.services || [appointment.service]).join(
		', ',
	)
	const text =
		`🔁 *Клиент перенёс запись*\n\n` +
		`👤 *Клиент:* ${e(appointment.userName)}\n` +
		`📞 *Телефон:* ${e(appointment.userPhone || 'не указан')}\n` +
		`💆 *Услуги:* ${e(servicesText)}\n` +
		`📅 *Новая дата:* ${e(appointment.date)}\n` +
		`⏰ *Новое время:* ${e(appointment.time)}\n\n` +
		`Требуется повторное подтверждение\\.`

	try {
		const data = await telegramRequest(token, {
			chat_id: Number(chatId),
			text,
			parse_mode: 'MarkdownV2',
		})
		if (!data.ok) {
			console.error(
				'❌ Telegram reschedule ошибка разметки:',
				JSON.stringify(data),
			)
			const plain = text
				.replace(/\\([_*[\]()~`>#+\-=|{}.!])/g, '$1')
				.replace(/[*`]/g, '')
			await telegramRequest(token, {
				chat_id: Number(chatId),
				text: plain,
			}).catch(() => {})
		}
	} catch (err) {
		console.error(
			'❌ Telegram reschedule сетевая ошибка:',
			err.code || err.message,
		)
	}
}

async function sendClientCancelNotification(appointment) {
	const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
	if (!token) return

	const e = escapeMarkdownV2
	const servicesText = (appointment.services || [appointment.service]).join(
		', ',
	)

	// Уведомление администратору — клиент отменил запись сам
	const adminChatId = (process.env.TELEGRAM_CHAT_ID || '').trim()
	if (adminChatId) {
		const adminText =
			`❌ *Клиент отменил запись*\n\n` +
			`👤 *Клиент:* ${e(appointment.userName)}\n` +
			`📞 *Телефон:* ${e(appointment.userPhone || 'не указан')}\n` +
			`💆 *Услуги:* ${e(servicesText)}\n` +
			`📅 *Дата:* ${e(appointment.date)}\n` +
			`⏰ *Время:* ${e(appointment.time)}`

		try {
			const data = await telegramRequest(token, {
				chat_id: Number(adminChatId),
				text: adminText,
				parse_mode: 'MarkdownV2',
			})
			if (!data.ok) {
				const plain = adminText
					.replace(/\\([_*[\]()~`>#+\-=|{}.!])/g, '$1')
					.replace(/[*`]/g, '')
				await telegramRequest(token, {
					chat_id: Number(adminChatId),
					text: plain,
				}).catch(() => {})
			}
		} catch (err) {
			console.error(
				'❌ Telegram admin (отмена клиентом) ошибка:',
				err.code || err.message,
			)
		}
	}

	// Подтверждение клиенту, если у него подключён Telegram
	const clientUser = await prisma.user.findUnique({
		where: { id: appointment.userId },
	})
	const clientChatId = clientUser?.telegramChatId
	if (clientChatId) {
		const clientText =
			`✅ *Запись отменена*\n\n` +
			`Вы отменили запись:\n` +
			`💆 ${e(servicesText)}\n` +
			`📅 ${e(appointment.date)} · ⏰ ${e(appointment.time)}\n\n` +
			`Будем рады видеть вас снова 💅`

		try {
			const data = await telegramRequest(token, {
				chat_id: Number(clientChatId),
				text: clientText,
				parse_mode: 'MarkdownV2',
			})
			if (!data.ok) {
				const plain = clientText
					.replace(/\\([_*[\]()~`>#+\-=|{}.!])/g, '$1')
					.replace(/[*`]/g, '')
				await telegramRequest(token, {
					chat_id: Number(clientChatId),
					text: plain,
				}).catch(() => {})
			}
		} catch (err) {
			console.error(
				'❌ Telegram клиент (отмена клиентом) ошибка:',
				err.code || err.message,
			)
		}
	}
}

// ─── Routes ────────────────────────────────────────────────────────────────────

// POST /api/appointments
router.post('/', authMiddleware, async (req, res) => {
	console.log(
		'🟢 [POST /api/appointments] получен запрос на создание записи, body:',
		req.body,
	)

	const { service, services, date, time, comment, phone } = req.body
	// Поддерживаем и старый формат (одна строка service), и новый (массив services)
	const serviceList =
		Array.isArray(services) && services.length
			? services
			: service
				? [service]
				: []

	if (!serviceList.length || !date || !time) {
		console.log('🔴 Отклонено: не указаны услуги/дата/время')
		return res
			.status(400)
			.json({ error: 'Укажите хотя бы одну услугу, дату и время' })
	}

	const duration = calcDuration(serviceList)
	const startHour = timeToHour(time)

	if (startHour < WORK_START_HOUR || startHour + duration > WORK_END_HOUR) {
		console.log('🔴 Отклонено: запись выходит за пределы рабочего дня')
		return res
			.status(400)
			.json({
				error:
					'Запись с такой длительностью не помещается в рабочий день, выберите время раньше',
			})
	}

	if (hoursUntilAppointment(date, time) < 0) {
		console.log('🔴 Отклонено: дата/время уже в прошлом')
		return res
			.status(400)
			.json({ error: 'Нельзя записаться на уже прошедшее время' })
	}

	const sameDayAppointments = await prisma.appointment.findMany({
		where: { date, status: { not: 'cancelled' } },
	})
	const conflict = sameDayAppointments.find(a => {
		const aDuration = a.duration || 1
		return rangesOverlap(startHour, duration, timeToHour(a.time), aDuration)
	})
	if (conflict) {
		console.log(
			'🔴 Отклонено: пересекается с занятой записью —',
			date,
			time,
			'duration:',
			duration,
		)
		return res
			.status(400)
			.json({
				error:
					'Это время уже занято (с учётом длительности услуги), выберите другое',
			})
	}

	const appointment = await prisma.appointment.create({
		data: {
			userId: req.user.id,
			userName: req.user.name,
			userEmail: req.user.email,
			userPhone: phone || req.user.phone || '',
			services: serviceList,
			service: serviceList.join(', '), // для обратной совместимости со старым полем
			duration,
			date,
			time,
			comment: comment || '',
			status: 'pending',
		},
	})
	console.log('🟢 Запись сохранена в базе данных, id:', appointment.id)

	// Отправка уведомления (не блокирует ответ клиенту)
	sendTelegramNotification(appointment).catch(e => {
		console.error('🔴 Telegram unhandled:', e.message)
	})

	res.json(appointment)
})

// GET /api/appointments/my
router.get('/my', authMiddleware, async (req, res) => {
	const appointments = await prisma.appointment.findMany({
		where: { userId: req.user.id },
		orderBy: { createdAt: 'desc' },
	})
	res.json(appointments)
})

// GET /api/appointments/slots?date=YYYY-MM-DD&duration=1|2|3&excludeId=...
// duration — сколько часов нужно для выбранных клиентом услуг (по умолчанию 1)
// excludeId — id записи, которую клиент переносит (чтобы не считать её же
// собственное текущее время "занятым" при показе доступных слотов)
router.get('/slots', async (req, res) => {
	const { date, excludeId } = req.query
	if (!date) return res.status(400).json({ error: 'Укажите дату' })

	const duration = Math.max(
		1,
		Math.min(parseInt(req.query.duration, 10) || 1, 3),
	)
	const allSlots = generateHourSlots()
	const appointments = await prisma.appointment.findMany({
		where: {
			date,
			status: { not: 'cancelled' },
			...(excludeId ? { id: { not: excludeId } } : {}),
		},
	})

	const available = allSlots.filter(slot => {
		const startHour = timeToHour(slot)
		if (startHour + duration > WORK_END_HOUR) return false // не помещается до закрытия
		return !appointments.some(a =>
			rangesOverlap(startHour, duration, timeToHour(a.time), a.duration || 1),
		)
	})

	const taken = allSlots.filter(s => !available.includes(s))
	res.json({ date, available, taken })
})

// DELETE /api/appointments/:id
// Отмена записи клиентом — доступна только если до начала процедуры
// осталось не менее 4 часов. После этого отменить может только мастер
// (через панель администратора, без ограничения по времени).
router.delete('/:id', authMiddleware, async (req, res) => {
	const appointment = await prisma.appointment.findFirst({
		where: { id: req.params.id, userId: req.user.id },
	})
	if (!appointment) return res.status(404).json({ error: 'Запись не найдена' })

	if (appointment.status === 'cancelled')
		return res.status(400).json({ error: 'Запись уже отменена' })
	if (appointment.status === 'completed')
		return res.status(400).json({ error: 'Запись уже завершена' })

	if (
		hoursUntilAppointment(appointment.date, appointment.time) <
		MIN_HOURS_BEFORE_CHANGE
	) {
		return res.status(403).json({ error: LOCKED_MESSAGE })
	}

	const cancelled = await prisma.appointment.update({
		where: { id: appointment.id },
		data: { status: 'cancelled' },
	})

	sendClientCancelNotification(cancelled).catch(e => {
		console.error('🔴 Telegram cancel unhandled:', e.message)
	})

	res.json({ message: 'Запись отменена' })
})

// PATCH /api/appointments/:id/reschedule
// Перенос записи клиентом на другую дату/время — тоже доступен только не
// позднее чем за 4 часа до начала ТЕКУЩЕЙ записи. После переноса статус
// сбрасывается в "pending" — мастеру нужно подтвердить новое время заново.
router.patch('/:id/reschedule', authMiddleware, async (req, res) => {
	const { date, time } = req.body
	if (!date || !time)
		return res.status(400).json({ error: 'Укажите новую дату и время' })

	const appointment = await prisma.appointment.findFirst({
		where: { id: req.params.id, userId: req.user.id },
	})
	if (!appointment) return res.status(404).json({ error: 'Запись не найдена' })

	if (appointment.status === 'cancelled')
		return res.status(400).json({ error: 'Запись уже отменена' })
	if (appointment.status === 'completed')
		return res.status(400).json({ error: 'Запись уже завершена' })

	if (
		hoursUntilAppointment(appointment.date, appointment.time) <
		MIN_HOURS_BEFORE_CHANGE
	) {
		return res.status(403).json({ error: LOCKED_MESSAGE })
	}

	const duration = appointment.duration || 1
	const startHour = timeToHour(time)

	if (startHour < WORK_START_HOUR || startHour + duration > WORK_END_HOUR) {
		return res
			.status(400)
			.json({
				error:
					'Запись с такой длительностью не помещается в рабочий день, выберите время раньше',
			})
	}

	if (hoursUntilAppointment(date, time) < 0) {
		return res
			.status(400)
			.json({ error: 'Нельзя перенести на уже прошедшее время' })
	}

	const sameDayAppointments = await prisma.appointment.findMany({
		where: { date, status: { not: 'cancelled' }, id: { not: appointment.id } },
	})
	const conflict = sameDayAppointments.find(a =>
		rangesOverlap(startHour, duration, timeToHour(a.time), a.duration || 1),
	)
	if (conflict) {
		return res
			.status(400)
			.json({ error: 'Это время уже занято, выберите другое' })
	}

	const updated = await prisma.appointment.update({
		where: { id: appointment.id },
		data: { date, time, status: 'pending' },
	})

	sendRescheduleNotification(updated).catch(e => {
		console.error('🔴 Telegram reschedule unhandled:', e.message)
	})

	res.json(updated)
})

module.exports = router
