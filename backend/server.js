require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/auth')
const appointmentRoutes = require('./routes/appointments')
const adminRoutes = require('./routes/admin')
const telegramRoutes = require('./routes/telegram')
const scheduleRoutes = require('./routes/schedule')

const app = express()
const PORT = process.env.PORT || 3001

// In production FRONTEND_URL will be set to the Vercel URL
const allowedOrigins = [
	'http://localhost:5173',
	process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) callback(null, true)
			else callback(new Error('Not allowed by CORS'))
		},
		credentials: true,
	}),
)
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/telegram', telegramRoutes)
app.use('/api/schedule', scheduleRoutes) // публичные роуты (next-slot)
app.use('/api/admin/schedule', scheduleRoutes) // admin-роуты (blocks CRUD, manual booking)

app.get('/', (req, res) =>
	res.json({ message: 'Kerri Nails API is running ✅' }),
)

app.listen(PORT, () => {
	console.log(`✅ Server running on http://localhost:${PORT}`)
	console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`)
	if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
		console.log(`📲 Telegram notifications: enabled`)
	} else {
		console.log(`⚠️  Telegram: not configured (.env)`)
	}
})
