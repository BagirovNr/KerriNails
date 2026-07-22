// Одноразовый скрипт: переносит старые 12 фото портфолио (раньше жили в
// frontend/src/utils/data.ts как PORTFOLIO_ITEMS + локальные картинки) в базу
// данных как base64, чтобы дальше их можно было редактировать/удалять/
// загружать новые из /dashboard/portfolio.
//
// Запуск (один раз, после `npx prisma migrate dev`), из папки backend/:
//   node prisma/seed-portfolio.js
//
// Скрипт ищет исходники в ../frontend/src/assets/ — запускать нужно из
// монорепо, где рядом лежит папка frontend/.

const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ASSETS_DIR = path.join(__dirname, '../../frontend/src/assets')

function toBase64(filename) {
	const filePath = path.join(ASSETS_DIR, filename)
	const buf = fs.readFileSync(filePath)
	return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const OLD_ITEMS = [
	{ file: 'nails.jpg', category: 'manicure', description: 'Нюдовый маникюр', order: 1 },
	{ file: 'nails2.jpg', category: 'design', description: 'Цветочный дизайн', order: 2 },
	{ file: 'nails3.jpg', category: 'manicure', description: 'Омбре гель-лак', order: 3 },
	{ file: 'sPokritiem.jpg', category: 'pedicure', description: 'Педикюр с покрытием', order: 4 },
	{ file: 'nails.jpg', category: 'extension', description: 'Наращивание миндаль', order: 5 },
	{ file: 'nails2.jpg', category: 'design', description: 'Геометрия', order: 6 },
	{ file: 'nails3.jpg', category: 'manicure', description: 'Французский маникюр', order: 7 },
	{ file: 'sPokritiem.jpg', category: 'design', description: 'Мраморный дизайн', order: 8 },
	{ file: 'nails.jpg', category: 'extension', description: 'Наращивание квадрат', order: 9 },
	{ file: 'nails2.jpg', category: 'pedicure', description: 'Педикюр летний', order: 10 },
	{ file: 'nails3.jpg', category: 'manicure', description: 'Нежный розовый', order: 11 },
	{ file: 'sPokritiem.jpg', category: 'design', description: 'Абстрактный арт', order: 12 },
]

async function main() {
	const existing = await prisma.portfolioItem.count()
	if (existing > 0) {
		console.log(`В базе уже есть ${existing} фото портфолио — пропускаю (скрипт не создаёт дублей при повторном запуске).`)
		return
	}

	for (const item of OLD_ITEMS) {
		const imageData = toBase64(item.file)
		await prisma.portfolioItem.create({
			data: {
				imageData,
				category: item.category,
				description: item.description,
				order: item.order,
			},
		})
	}
	console.log(`Готово: ${OLD_ITEMS.length} фото портфолио перенесено в базу.`)
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
