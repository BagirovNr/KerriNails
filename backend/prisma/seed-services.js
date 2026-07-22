// Одноразовый скрипт: переносит текущие услуги/цены (раньше жили в
// frontend/src/utils/data.ts) в базу данных, чтобы дальше их можно было
// редактировать из /dashboard/services, а не через правку кода.
//
// Запуск (один раз, после `npx prisma migrate dev`):
//   node prisma/seed-services.js
//
// Скрипт безопасно идемпотентен: использует upsert по slug, повторный запуск
// не создаст дублей — только обновит существующие записи, если их не трогали.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SERVICES = [
	{ slug: 'classic-manicure', category: 'manicure', name: 'Классический маникюр', price: 1500, order: 1, description: 'Обработка кутикулы, форма ногтей, базовое покрытие' },
	{ slug: 'gel-manicure', category: 'manicure', name: 'Маникюр гель-лак', price: 2500, order: 2, description: 'Полная обработка + стойкое покрытие до 4 недель' },
	{ slug: 'french', category: 'manicure', name: 'Французский маникюр', price: 2800, order: 3, description: 'Элегантный классический «лунный» дизайн' },
	{ slug: 'express-manicure', category: 'manicure', name: 'Экспресс-маникюр', price: 1000, order: 4, description: 'Быстрый маникюр без покрытия за 30 минут' },
	{ slug: 'pedicure-coating', category: 'pedicure', name: 'Педикюр с покрытием', price: 2800, order: 5, description: 'Педикюр + гель-лак, красота до 4 недель' },
	{ slug: 'pedicure-classic', category: 'pedicure', name: 'Классический педикюр', price: 1800, order: 6, description: 'Уход за стопами без покрытия' },
	{ slug: 'nail-design', category: 'design', name: 'Дизайн ногтей', price: 800, order: 7, description: 'Индивидуальный дизайн на 10 ногтях' },
	{ slug: 'nail-extension', category: 'extension', name: 'Наращивание ногтей', price: 3500, order: 8, description: 'Моделирование длины и формы гелем' },
	{ slug: 'correction', category: 'extension', name: 'Коррекция наращивания', price: 2000, order: 9, description: 'Обновление линии роста и коррекция формы' },
	{ slug: 'spa-hands', category: 'care', name: 'Спа-уход для рук', price: 1800, order: 10, description: 'Пилинг, маска и массаж для глубокого увлажнения' },
	{ slug: 'removal', category: 'care', name: 'Снятие покрытия', price: 500, order: 11, description: 'Аккуратное снятие гель-лака' },
	{ slug: 'strengthening', category: 'care', name: 'Укрепление ногтей', price: 1200, order: 12, description: 'Акриловая пудра или гель для укрепления' },
]

async function main() {
	for (const s of SERVICES) {
		await prisma.service.upsert({
			where: { slug: s.slug },
			update: {},
			create: s,
		})
	}
	console.log(`Готово: ${SERVICES.length} услуг проверено/добавлено в базу.`)
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
