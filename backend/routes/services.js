const express = require('express')
const prisma = require('../lib/prisma')

const router = express.Router()

// GET /api/services — только активные услуги (для сайта и формы записи)
router.get('/', async (req, res) => {
	const services = await prisma.service.findMany({
		where: { active: true },
		orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
	})
	res.json(services)
})

module.exports = router
