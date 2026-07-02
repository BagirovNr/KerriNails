/**
 * Запустите этот скрипт ОДИН РАЗ, чтобы создать администратора:
 *   node create-admin.js
 *
 * Перед запуском убедитесь, что в .env указан DATABASE_URL
 * и что вы выполнили `npx prisma migrate dev` хотя бы один раз.
 */
const bcrypt = require('bcryptjs')
const prisma = require('./lib/prisma')

async function main() {
	const existingAdmin = await prisma.user.findFirst({
		where: { role: 'admin' },
	})
	if (existingAdmin) {
		console.log('Администратор уже существует.')
		return
	}

	const password = 'admin123' // Измените на свой пароль!
	const hashed = await bcrypt.hash(password, 10)

	await prisma.user.create({
		data: {
			name: 'Администратор',
			phone: '+79992488379',
			email: 'admin@kerrinails.ru',
			password: hashed,
			role: 'admin',
		},
	})

	console.log('✅ Администратор создан!')
	console.log('   Email: admin@kerrinails.ru')
	console.log('   Пароль: admin123')
	console.log('   ⚠️  Измените пароль после первого входа!')
}

main()
	.catch(e => {
		console.error('❌ Ошибка при создании администратора:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
