const express = require('express')
const prisma = require('../lib/prisma')

const router = express.Router()

// GET /api/banners — только баннеры, чей период показа включает текущий момент
router.get('/', async (req, res) => {
	const now = new Date()
	const banners = await prisma.banner.findMany({
		where: { startDate: { lte: now }, endDate: { gte: now } },
		orderBy: { createdAt: 'desc' },
	})
	res.json(banners)
})

module.exports = router
