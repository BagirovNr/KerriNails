// backend/routes/schedule.js
// Управление расписанием мастера: выходные, отпуск, блокировка слотов,
// ручная запись клиента.
//
// GET    /api/schedule/blocks?from=YYYY-MM-DD&to=YYYY-MM-DD  — публичный, нужен фронтенду клиента
// POST   /api/admin/schedule/blocks                          — добавить блок (только мастер)
// DELETE /api/admin/schedule/blocks/:id                     — удалить блок
// GET    /api/admin/schedule/next-slot?from=YYYY-MM-DD&duration=N — ближайший свободный слот
// POST   /api/admin/schedule/manual-booking                 — ручная запись клиента мастером
// GET    /api/admin/schedule/clients-search?q=...           — поиск клиентов для ручной записи

const express = require('express')
const prisma = require('../lib/prisma')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

// ─── Константы (дублируют appointments.js) ───────────────────────────────────
const WORK_START_HOUR = 10
const WORK_END_HOUR = 20
const SALON_UTC_OFFSET_HOURS = 3

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

function rangesOverlap(startA, durA, startB, durB) {
	return startA < startB + durB && startB < startA + durA
}

// Возвращает все даты входящие в отпуск (диапазон dateFrom..dateTo)
function expandVacation(block) {
	const dates = []
	const cur = new Date(`${block.dateFrom}T00:00:00Z`)
	const end = new Date(`${block.dateTo}T00:00:00Z`)
	while (cur <= end) {
		dates.push(cur.toISOString().split('T')[0])
		cur.setUTCDate(cur.getUTCDate() + 1)
	}
	return dates
}

// Проверяет: является ли указанная дата заблокированной (полностью)
async function isDayBlocked(date) {
	const blocks = await prisma.scheduleBlock.findMany({
		where: {
			OR: [
				{ type: 'day_off', date },
				{ type: 'vacation', dateFrom: { lte: date }, dateTo: { gte: date } },
			],
		},
	})
	return blocks.length > 0
}

// ─── Публичные роуты (видны клиентам через /api/schedule) ───────────────────

// GET /api/schedule/blocks?from=YYYY-MM-DD&to=YYYY-MM-DD
// Фронтенд клиента вызывает это при выборе даты, чтобы знать, какие дни
// заблокированы целиком и какие слоты недоступны.
router.get('/blocks', async (req, res) => {
	const { from, to } = req.query
	if (!from || !to) return res.status(400).json({ error: 'Укажите from и to' })

	const blocks = await prisma.scheduleBlock.findMany({
		where: {
			OR: [
				// Выходные и блокировки слотов в диапазоне
				{
					type: { in: ['day_off', 'blocked_slot'] },
					date: { gte: from, lte: to },
				},
				// Отпуска пересекающиеся с диапазоном
				{ type: 'vacation', dateFrom: { lte: to }, dateTo: { gte: from } },
			],
		},
	})

	// Раскрываем отпуска в список конкретных дат
	const blockedDays = new Set()
	const blockedSlots = {} // date -> [{ startTime, endTime }]

	for (const b of blocks) {
		if (b.type === 'day_off') {
			blockedDays.add(b.date)
		} else if (b.type === 'vacation') {
			for (const d of expandVacation(b)) {
				if (d >= from && d <= to) blockedDays.add(d)
			}
		} else if (b.type === 'blocked_slot') {
			if (!blockedSlots[b.date]) blockedSlots[b.date] = []
			blockedSlots[b.date].push({
				startTime: b.startTime,
				endTime: b.endTime,
				reason: b.reason,
			})
		}
	}

	res.json({ blockedDays: [...blockedDays], blockedSlots })
})

// ─── Роуты только для мастера (/api/admin/schedule/*) ────────────────────────

// GET /api/admin/schedule/blocks?from=...&to=...
// Расширенная версия для AdminPanel — возвращает также id и reason
router.get('/admin/blocks', adminMiddleware, async (req, res) => {
	const { from, to } = req.query
	if (!from || !to) return res.status(400).json({ error: 'Укажите from и to' })

	const blocks = await prisma.scheduleBlock.findMany({
		where: {
			OR: [
				{
					type: { in: ['day_off', 'blocked_slot'] },
					date: { gte: from, lte: to },
				},
				{ type: 'vacation', dateFrom: { lte: to }, dateTo: { gte: from } },
			],
		},
		orderBy: { createdAt: 'asc' },
	})
	res.json(blocks)
})

// POST /api/admin/schedule/blocks
// Создать выходной / отпуск / заблокировать слот
router.post('/admin/blocks', adminMiddleware, async (req, res) => {
	const { type, date, dateFrom, dateTo, startTime, endTime, reason } = req.body

	if (!['day_off', 'vacation', 'blocked_slot'].includes(type)) {
		return res.status(400).json({ error: 'Неверный тип блока' })
	}
	if (type === 'vacation' && (!dateFrom || !dateTo)) {
		return res
			.status(400)
			.json({ error: 'Укажите dateFrom и dateTo для отпуска' })
	}
	if ((type === 'day_off' || type === 'blocked_slot') && !date) {
		return res.status(400).json({ error: 'Укажите date' })
	}
	if (type === 'blocked_slot' && (!startTime || !endTime)) {
		return res.status(400).json({ error: 'Укажите startTime и endTime' })
	}

	const block = await prisma.scheduleBlock.create({
		data: {
			type,
			date: date || null,
			dateFrom: dateFrom || null,
			dateTo: dateTo || null,
			startTime: startTime || null,
			endTime: endTime || null,
			reason: reason || '',
		},
	})
	res.json(block)
})

// DELETE /api/admin/schedule/blocks/:id
router.delete('/admin/blocks/:id', adminMiddleware, async (req, res) => {
	const block = await prisma.scheduleBlock.findUnique({
		where: { id: req.params.id },
	})
	if (!block) return res.status(404).json({ error: 'Блок не найден' })
	await prisma.scheduleBlock.delete({ where: { id: req.params.id } })
	res.json({ message: 'Блок удалён' })
})

// GET /api/admin/schedule/next-slot?from=YYYY-MM-DD&duration=1
// Найти ближайший свободный слот начиная с указанной даты.
// Также используется на фронтенде клиента, когда выбранный день заблокирован.
router.get('/next-slot', async (req, res) => {
	const { from, duration: durStr } = req.query
	if (!from) return res.status(400).json({ error: 'Укажите from' })
	const duration = Math.max(1, Math.min(parseInt(durStr, 10) || 1, 3))

	const salonNowUtcMs = Date.now() + SALON_UTC_OFFSET_HOURS * 60 * 60 * 1000
	const salonToday = new Date(salonNowUtcMs).toISOString().split('T')[0]
	const salonCurrentHour = new Date(salonNowUtcMs).getUTCHours()

	// Ищем среди следующих 60 дней
	const cur = new Date(`${from}T00:00:00Z`)
	for (let i = 0; i < 60; i++) {
		const dateStr = cur.toISOString().split('T')[0]

		const blocked = await isDayBlocked(dateStr)
		if (!blocked) {
			// Получаем занятые записи и заблокированные слоты на этот день
			const [appointments, slotBlocks] = await Promise.all([
				prisma.appointment.findMany({
					where: { date: dateStr, status: { not: 'cancelled' } },
				}),
				prisma.scheduleBlock.findMany({
					where: { type: 'blocked_slot', date: dateStr },
				}),
			])

			const slots = generateHourSlots()
			for (const slot of slots) {
				const startHour = timeToHour(slot)

				// Не предлагать прошедшие слоты сегодня
				if (dateStr === salonToday && startHour <= salonCurrentHour) continue
				if (startHour + duration > WORK_END_HOUR) continue

				const appointmentConflict = appointments.some(a =>
					rangesOverlap(
						startHour,
						duration,
						timeToHour(a.time),
						a.duration || 1,
					),
				)
				const blockConflict = slotBlocks.some(b => {
					const bStart = timeToHour(b.startTime)
					const bEnd = timeToHour(b.endTime)
					return startHour < bEnd && bStart < startHour + duration
				})

				if (!appointmentConflict && !blockConflict) {
					return res.json({ date: dateStr, time: slot })
				}
			}
		}

		cur.setUTCDate(cur.getUTCDate() + 1)
	}

	res.json({ date: null, time: null }) // ничего не нашли в 60 днях
})

// GET /api/admin/schedule/clients-search?q=имя_или_телефон
// Поиск клиентов для ручной записи мастером
router.get('/admin/clients-search', adminMiddleware, async (req, res) => {
	const q = (req.query.q || '').trim()
	if (q.length < 2) return res.json([])

	const users = await prisma.user.findMany({
		where: {
			role: 'client',
			OR: [
				{ name: { contains: q, mode: 'insensitive' } },
				{ phone: { contains: q } },
				{ email: { contains: q, mode: 'insensitive' } },
			],
		},
		select: { id: true, name: true, phone: true, email: true },
		take: 10,
	})
	res.json(users)
})

// POST /api/admin/schedule/manual-booking
// Мастер записывает клиента вручную. Если клиент с таким телефоном не существует —
// создаём «ghost» аккаунт с временным паролем, чтобы запись появилась в
// Appointment как обычная, только с source = 'manual'. Это позволяет потом
// клиенту зарегистрироваться с тем же телефоном и увидеть свои записи.
router.post('/admin/manual-booking', adminMiddleware, async (req, res) => {
	const {
		userId,
		guestName,
		guestPhone,
		guestEmail,
		service,
		services,
		date,
		time,
		comment,
		duration: durationOverride,
	} = req.body

	const serviceList =
		Array.isArray(services) && services.length
			? services
			: service
				? [service]
				: []
	if (!serviceList.length || !date || !time) {
		return res.status(400).json({ error: 'Укажите услугу, дату и время' })
	}

	const duration = durationOverride || serviceList.length || 1
	const startHour = timeToHour(time)

	// Проверка коллизий
	const sameDayAppointments = await prisma.appointment.findMany({
		where: { date, status: { not: 'cancelled' } },
	})
	const conflict = sameDayAppointments.find(a =>
		rangesOverlap(startHour, duration, timeToHour(a.time), a.duration || 1),
	)
	if (conflict) {
		return res.status(400).json({ error: 'Это время уже занято' })
	}

	let targetUser

	if (userId) {
		// Записываем существующего клиента
		targetUser = await prisma.user.findUnique({ where: { id: userId } })
		if (!targetUser) return res.status(404).json({ error: 'Клиент не найден' })
	} else {
		// Гостевая запись — ищем или создаём по телефону
		if (!guestName || !guestPhone) {
			return res.status(400).json({ error: 'Укажите имя и телефон клиента' })
		}
		const phone = guestPhone.trim()
		const email =
			guestEmail?.trim() || `${phone.replace(/\D/g, '')}@guest.kerrinails.ru`

		targetUser = await prisma.user.findUnique({ where: { phone } })
		if (!targetUser) {
			const bcrypt = require('bcryptjs')
			const { v4: uuidv4 } = require('uuid')
			const tmpPassword = await bcrypt.hash(uuidv4(), 10)
			targetUser = await prisma.user.create({
				data: {
					name: guestName.trim(),
					phone,
					email,
					password: tmpPassword,
					role: 'client',
				},
			})
		}
	}

	const appointment = await prisma.appointment.create({
		data: {
			userId: targetUser.id,
			userName: targetUser.name,
			userEmail: targetUser.email,
			userPhone: targetUser.phone,
			services: serviceList,
			service: serviceList.join(', '),
			duration,
			date,
			time,
			comment: comment || '',
			status: 'confirmed', // Ручная запись мастером — сразу подтверждена
			source: 'manual',
		},
	})

	res.json(appointment)
})

module.exports = router
