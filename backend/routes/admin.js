const express = require('express')
const { readJson, writeJson } = require('../middleware/storage')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

// GET /api/admin/appointments
router.get('/appointments', adminMiddleware, (req, res) => {
  const appointments = readJson('appointments.json')
  res.json(appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

// PATCH /api/admin/appointments/:id/status
router.patch('/appointments/:id/status', adminMiddleware, (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'Неверный статус' })

  const appointments = readJson('appointments.json')
  const idx = appointments.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Запись не найдена' })

  appointments[idx].status = status
  writeJson('appointments.json', appointments)
  res.json(appointments[idx])
})

// GET /api/admin/users
router.get('/users', adminMiddleware, (req, res) => {
  const users = readJson('users.json')
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt })))
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
    totalClients: users.filter(u => u.role === 'client').length
  })
})

module.exports = router
