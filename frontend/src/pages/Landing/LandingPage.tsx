import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp, FaTelegram, FaArrowRightLong } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../../components/forms/AuthModal'
import BookingModal from '../../components/BookingForm/BookingModal'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher'
import posterImg from '../../assets/nails3.jpg'

const TILES = (t: (k: string) => string, onBook: () => void) => [
	{
		label: t('landing.book'),
		action: 'book',
		gradient: 'from-pink-500 to-rose-500',
		emoji: '💅',
	},
	{
		label: t('landing.prices'),
		href: '/prices',
		gradient: 'from-purple-500 to-pink-500',
		emoji: '💰',
	},
	{
		label: t('landing.portfolio'),
		href: '/portfolio',
		gradient: 'from-rose-400 to-orange-400',
		emoji: '✨',
	},
	{
		label: t('landing.review'),
		href: 'https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true',
		external: true,
		gradient: 'from-green-400 to-emerald-500',
		emoji: '⭐',
	},
]

// ─── Быстрая связь ────────────────────────────────────────────────────────────
// Номер и юзернейм можно переопределить через .env (VITE_WHATSAPP_PHONE,
// VITE_TELEGRAM_CONTACT), не трогая код. Формат VITE_WHATSAPP_PHONE — цифры
// без "+" и пробелов (79991234567). VITE_TELEGRAM_CONTACT — либо юзернейм
// бота/аккаунта (kerrinails), либо номер в формате +7991234567.
const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '79992488379'
const TELEGRAM_CONTACT = import.meta.env.VITE_TELEGRAM_CONTACT || '+79992488379'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Здравствуйте! Хочу записаться на маникюр 💅')}`
const TELEGRAM_LINK = `https://t.me/${TELEGRAM_CONTACT.replace(/^@/, '')}`

export default function LandingPage() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const [authOpen, setAuthOpen] = useState(false)
	const [bookOpen, setBookOpen] = useState(false)

	const handleBook = () => (user ? setBookOpen(true) : setAuthOpen(true))

	return (
		<div className='min-h-screen flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden'>
			{/* ─── Фоновое видео ─── */}
			<video
				className='absolute inset-0 w-full h-full object-cover object-[50%_40%]'
				src='/videos/hero.mp4'
				poster={posterImg}
				autoPlay
				muted
				loop
				playsInline
			/>
			{/* Затемнение поверх видео — чтобы текст и кнопки было видно */}
			<div className='absolute inset-0 bg-gradient-to-br from-gray-950/90 via-rose-950/80 to-gray-900/90' />

			{/* Background orbs */}
			<div className='absolute top-20 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none' />
			<div className='absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none' />

			{/* Language switcher */}
			<div className='absolute top-5 right-5 z-10'>
				<LanguageSwitcher />
			</div>

			{/* ─── Контент (поверх видео и затемнения) ─── */}
			<div className='relative z-10 flex flex-col items-center w-full'>
				{/* Logo */}

				<h1
					className='text-4xl font-black text-center mb-1 text-white tracking-tight animate-fadeInUp'
					style={{ fontFamily: 'Georgia, serif' }}
				>
					Kerri <span className='text-pink-400'>Nails</span>
				</h1>
				<p className='text-gray-300 text-sm text-center mb-5 animate-fadeInUp'>
					{t('landing.subtitle')}
				</p>

				{/* Быстрая связь: WhatsApp / Telegram */}
				<div className='flex gap-3 mb-7 animate-fadeInUp'>
					<a
						href={WHATSAPP_LINK}
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center gap-2 bg-[#25D366] hover:bg-[#1fbd59] text-white text-sm font-semibold pl-3.5 pr-4 py-2.5 rounded-full shadow-lg shadow-black/20 active:scale-95 transition-all'
					>
						<FaWhatsapp className='text-lg' />
						WhatsApp
					</a>
					<a
						href={TELEGRAM_LINK}
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center gap-2 bg-[#26A5E4] hover:bg-[#2196cc] text-white text-sm font-semibold pl-3.5 pr-4 py-2.5 rounded-full shadow-lg shadow-black/20 active:scale-95 transition-all'
					>
						<FaTelegram className='text-lg' />
						Telegram
					</a>
				</div>

				{/* 2×2 grid */}
				<div className='grid grid-cols-2 gap-3 w-full max-w-xs animate-fadeInUp'>
					{TILES(t, handleBook).map(tile => {
						const inner = (
							<div
								className={`bg-gradient-to-br ${tile.gradient} p-0.5 rounded-2xl`}
							>
								<div className='bg-gray-900/80 backdrop-blur-sm rounded-[14px] px-4 py-5 text-center flex flex-col items-center gap-2 hover:bg-gray-800/80 active:scale-95 transition-all duration-200'>
									<span className='text-2xl'>{tile.emoji}</span>
									<span className='text-white font-semibold text-sm leading-tight'>
										{tile.label}
									</span>
								</div>
							</div>
						)
						if (tile.action === 'book')
							return (
								<button key={tile.label} onClick={handleBook} className='block'>
									{inner}
								</button>
							)
						if (tile.external)
							return (
								<a
									key={tile.label}
									href={tile.href}
									target='_blank'
									rel='noopener noreferrer'
									className='block'
								>
									{inner}
								</a>
							)
						return (
							<Link key={tile.label} to={tile.href!} className='block'>
								{inner}
							</Link>
						)
					})}
				</div>

				{/* Full site link — заметная кнопка */}
				<Link
					to='/home'
					className='group mt-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 backdrop-blur-sm text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg transition-all active:scale-95 animate-fadeInUp'
				>
					{t('landing.full_site')}
					<FaArrowRightLong className='text-sm transition-transform group-hover:translate-x-1' />
				</Link>

				{authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
				{bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
			</div>
		</div>
	)
}
