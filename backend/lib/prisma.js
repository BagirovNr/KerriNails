// Единый экземпляр Prisma Client на всё приложение.
// Импортируйте его так: const prisma = require('../lib/prisma')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
