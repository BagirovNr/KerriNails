const express = require('express')
const prisma = require('../lib/prisma')

const router = express.Router()

// GET /api/portfolio — все фото портфолио, для публичного сайта
router.get('/', async (req, res) => {
	const items = await prisma.portfolioItem.findMany({
		orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
	})
	res.json(items)
})

module.exports = router
