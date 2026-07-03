// Единая точка правды для ссылок на соцсети салона.
// Поменять номер/юзернейм/ссылку можно через .env, не трогая код —
// см. frontend/.env.example.

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '79992488379'
const TELEGRAM_CONTACT = (
	import.meta.env.VITE_TELEGRAM_CONTACT || '+79992488379'
).replace(/^@/, '')

// Instagram и VK — ссылки на официальные страницы. По умолчанию пусто:
// пока вы не укажете свои VITE_INSTAGRAM_URL / VITE_VK_URL в .env, иконки
// на сайте будут видны, но некликабельны (чтобы случайно не вести на
// чужую страницу).
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || ''
const VK_URL = import.meta.env.VITE_VK_URL || ''

export const SOCIAL_LINKS = {
	whatsapp: `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Здравствуйте! Хочу записаться на маникюр 💅')}`,
	telegram: `https://t.me/${TELEGRAM_CONTACT}?text=${encodeURIComponent('Здравствуйте! Хочу записаться на маникюр 💅')}`,
	instagram: 'https://www.instagram.com/kerii.nailss',
	vk: 'https://vk.com/keriinailss',
}
