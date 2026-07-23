import nails from '../assets/nails.jpg'
import nails2 from '../assets/nails2.jpg'
import nails3 from '../assets/nails3.jpg'
import sPokritiem from '../assets/sPokritiem.jpg'

/**
 * Цены и тексты услуг теперь редактируются админом в БД (см. useServices),
 * но картинки — часть сборки фронтенда, поэтому подбираются по категории.
 * Если понадобится загрузка своих фото на услугу — это отдельная задача
 * (нужно поле imageUrl в Service + загрузка файлов).
 */
const CATEGORY_IMAGES: Record<string, string> = {
	manicure: nails,
	pedicure: sPokritiem,
	design: nails2,
	extension: nails3,
	care: nails2,
}

export function getServiceImage(category: string): string {
	return CATEGORY_IMAGES[category] || nails
}
