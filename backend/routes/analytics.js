const express = require('express')
const prisma = require('../lib/prisma')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

const WORK_HOURS_PER_DAY = 10 // 10:00–20:00, см. WORK_START_HOUR/WORK_END_HOUR в routes/schedule.js

function monthKey(dateStr) {
	return String(dateStr).slice(0, 7) // "YYYY-MM"
}

function daysInMonth(year, month /* 1-12 */) {
	return new Date(year, month, 0).getDate()
}

/** Последние `count` месяцев в формате YYYY-MM, от старых к новым, включая текущий */
function lastMonthKeys(count) {
	const keys = []
	const now = new Date()
	for (let i = count - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
		keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
	}
	return keys
}

function monthLabel(key) {
	const [y, m] = key.split('-').map(Number)
	return new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
}

// GET /api/admin/analytics?months=6
router.get('/analytics', adminMiddleware, async (req, res) => {
	const monthsCount = Math.min(Math.max(Number(req.query.months) || 6, 1), 12)
	const months = lastMonthKeys(monthsCount)
	const periodStart = `${months[0]}-01`

	const [appointments, services, users, blocks] = await Promise.all([
		prisma.appointment.findMany({ where: { date: { gte: periodStart } } }),
		prisma.service.findMany(),
		prisma.user.findMany({ where: { role: 'client' } }),
		prisma.scheduleBlock.findMany(),
	])

	const priceByName = new Map(services.map(s => [s.name, s.price]))
	function appointmentRevenue(a) {
		const list = a.services && a.services.length ? a.services : [a.service]
		return list.reduce((sum, name) => sum + (priceByName.get(name) || 0), 0)
	}

	// ── Инициализация помесячных бакетов ────────────────────────────────────
	const empty = () => Object.fromEntries(months.map(m => [m, 0]))
	const bookings = empty()
	const revenue = empty()
	const cancellations = empty()
	const bookedHours = empty()
	const completedCount = empty()
	const newClients = empty()

	for (const a of appointments) {
		const mk = monthKey(a.date)
		if (!(mk in bookings)) continue // вне выбранного периода

		bookings[mk]++
		if (a.status === 'cancelled') cancellations[mk]++
		if (a.status !== 'cancelled') bookedHours[mk] += a.duration || 1
		if (a.status === 'completed') {
			revenue[mk] += appointmentRevenue(a)
			completedCount[mk]++
		}
	}

	for (const u of users) {
		const mk = monthKey(u.createdAt.toISOString())
		if (mk in newClients) newClients[mk]++
	}

	// ── Загрузка мастера: доступные часы = дни месяца*10 − выходные/отпуск*10 − заблокированные слоты ──
	const availableHours = empty()
	for (const mk of months) {
		const [y, m] = mk.split('-').map(Number)
		const totalDays = daysInMonth(y, m)
		let offDays = 0
		let blockedHours = 0

		for (const b of blocks) {
			if (b.type === 'day_off' && b.date && monthKey(b.date) === mk) offDays++
			if (b.type === 'vacation' && b.dateFrom && b.dateTo) {
				for (let d = 1; d <= totalDays; d++) {
					const dateStr = `${mk}-${String(d).padStart(2, '0')}`
					if (dateStr >= b.dateFrom && dateStr <= b.dateTo) offDays++
				}
			}
			if (b.type === 'blocked_slot' && b.date && monthKey(b.date) === mk && b.startTime && b.endTime) {
				const [sh, sm] = b.startTime.split(':').map(Number)
				const [eh, em] = b.endTime.split(':').map(Number)
				blockedHours += eh + em / 60 - (sh + sm / 60)
			}
		}
		availableHours[mk] = Math.max((totalDays - offDays) * WORK_HOURS_PER_DAY - blockedHours, 0)
	}

	// ── Популярные услуги (по всем не отменённым записям за период) ────────
	const serviceCounts = new Map()
	for (const a of appointments) {
		if (a.status === 'cancelled') continue
		const list = a.services && a.services.length ? a.services : [a.service]
		for (const name of list) {
			if (!name) continue
			const entry = serviceCounts.get(name) || { name, count: 0, revenue: 0 }
			entry.count++
			entry.revenue += priceByName.get(name) || 0
			serviceCounts.set(name, entry)
		}
	}
	const popularServices = [...serviceCounts.values()].sort((a, b) => b.count - a.count).slice(0, 8)

	// ── Новые vs постоянные клиенты (по клиентам, имевшим запись в периоде) ─
	const nonCancelled = appointments.filter(a => a.status !== 'cancelled')
	const apptsByClient = new Map()
	for (const a of nonCancelled) {
		if (!apptsByClient.has(a.userId)) apptsByClient.set(a.userId, [])
		apptsByClient.get(a.userId).push(a)
	}
	// "Постоянный" — у клиента 2+ записи за всё время (не только в периоде)
	const allAppointmentsByClient = new Map()
	const allAppointments = await prisma.appointment.findMany({
		where: { status: { not: 'cancelled' } },
		select: { userId: true },
	})
	for (const a of allAppointments) {
		allAppointmentsByClient.set(a.userId, (allAppointmentsByClient.get(a.userId) || 0) + 1)
	}

	const activeClientIds = [...apptsByClient.keys()]
	const returningClientIds = activeClientIds.filter(id => (allAppointmentsByClient.get(id) || 0) >= 2)
	const newClientCount = activeClientIds.length - returningClientIds.length
	const repeatRate = activeClientIds.length > 0 ? (returningClientIds.length / activeClientIds.length) * 100 : 0

	// ── Средний чек ──────────────────────────────────────────────────────────
	const totalRevenue = Object.values(revenue).reduce((a, b) => a + b, 0)
	const totalCompleted = Object.values(completedCount).reduce((a, b) => a + b, 0)
	const avgCheck = totalCompleted > 0 ? Math.round(totalRevenue / totalCompleted) : 0

	res.json({
		months: months.map(mk => ({ key: mk, label: monthLabel(mk) })),
		bookingsByMonth: months.map(mk => ({ month: mk, label: monthLabel(mk), value: bookings[mk] })),
		revenueByMonth: months.map(mk => ({ month: mk, label: monthLabel(mk), value: revenue[mk] })),
		cancellationsByMonth: months.map(mk => ({ month: mk, label: monthLabel(mk), value: cancellations[mk] })),
		newClientsByMonth: months.map(mk => ({ month: mk, label: monthLabel(mk), value: newClients[mk] })),
		utilizationByMonth: months.map(mk => ({
			month: mk,
			label: monthLabel(mk),
			value: availableHours[mk] > 0 ? Math.round((bookedHours[mk] / availableHours[mk]) * 100) : 0,
		})),
		popularServices,
		clients: {
			newInPeriod: newClientCount,
			returningInPeriod: returningClientIds.length,
			repeatRate: Math.round(repeatRate * 10) / 10,
		},
		totals: {
			totalRevenue,
			totalBookings: Object.values(bookings).reduce((a, b) => a + b, 0),
			totalCancellations: Object.values(cancellations).reduce((a, b) => a + b, 0),
			avgCheck,
		},
	})
})

module.exports = router
