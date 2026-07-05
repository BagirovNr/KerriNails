const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '79992488379'
const TELEGRAM_CONTACT = (
	import.meta.env.VITE_TELEGRAM_CONTACT || '+79992488379'
).replace(/^@/, '')

const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || ''
const VK_URL = import.meta.env.VITE_VK_URL || ''

export const SOCIAL_LINKS = {
	whatsapp: `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Здравствуйте! Хочу записаться на маникюр 💅')}`,
	telegram: `https://t.me/${TELEGRAM_CONTACT}?text=${encodeURIComponent('Здравствуйте! Хочу записаться на маникюр 💅')}`,
	instagram: 'https://www.instagram.com/kerii.nailss',
	vk: 'https://vk.com/keriinailss',
}
