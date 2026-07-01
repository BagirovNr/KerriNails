import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import AuthModal from '../forms/AuthModal'
import BookingModal from '../BookingForm/BookingModal'

export default function Header() {
	const { t } = useTranslation()
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)
	const [authOpen, setAuthOpen] = useState(false)
	const [bookOpen, setBookOpen] = useState(false)

	const navLinks = [
		{ to: '/home', label: t('nav.home') },
		{ to: '/services', label: t('nav.services') },
		{ to: '/portfolio', label: t('nav.portfolio') },
		{ to: '/prices', label: t('nav.prices') },
		{ to: '/contact', label: t('nav.contact') },
	]

	const closeMenu = () => setMenuOpen(false)

	return (
		<>
			<header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm'>
				{/* Top bar - desktop only */}
				<div className='hidden md:flex items-center justify-between px-6 py-2 border-b border-gray-100 text-sm text-gray-500 max-w-7xl mx-auto'>
					<div className='flex items-center gap-6'>
						<a
							href='tel:+79992488379'
							className='hover:text-pink-600 transition-colors flex items-center gap-1.5'
						>
							<svg
								className='w-3.5 h-3.5'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z' />
							</svg>
							+7 (999) 248-83-79
						</a>
						<a
							href='https://yandex.ru/maps/org/kerii_nailss/109264447499/'
							target='_blank'
							rel='noopener noreferrer'
							className='hover:text-pink-600 transition-colors flex items-center gap-1.5'
						>
							<svg
								className='w-3.5 h-3.5'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
							</svg>
							Всеволожский пр., 7
						</a>
					</div>
					<div className='flex items-center gap-4'>
						<span className='text-gray-400'>Пн–Сб: 10:00–20:00</span>
						<LanguageSwitcher />
					</div>
				</div>

				{/* Main nav */}
				<div className='flex items-center justify-between px-4 md:px-6 py-3 max-w-7xl mx-auto'>
					{/* Mobile: burger */}
					<button
						className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
						onClick={() => setMenuOpen(o => !o)}
						aria-label='Menu'
					>
						<div
							className={`w-5 h-0.5 bg-gray-700 mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
						/>
						<div
							className={`w-5 h-0.5 bg-gray-700 mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}
						/>
						<div
							className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
						/>
					</button>

					{/* Logo */}
					<Link
						to='/home'
						className='text-xl font-bold tracking-tight'
						style={{ fontFamily: 'Georgia, serif' }}
					>
						<span className='text-gray-800'>Kerri</span>
						<span className='text-pink-500'> Nails</span>
					</Link>

					{/* Desktop nav links */}
					<nav className='hidden md:flex items-center gap-6'>
						{navLinks.map(l => (
							<Link
								key={l.to}
								to={l.to}
								className='text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors relative group'
							>
								{l.label}
								<span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300' />
							</Link>
						))}
					</nav>

					{/* Right: auth + book */}
					<div className='flex items-center gap-2'>
						<div className='md:hidden'>
							<LanguageSwitcher />
						</div>

						{user ? (
							<div className='flex items-center gap-2'>
								{user.role === 'admin' && (
									<Link
										to='/admin'
										className='hidden sm:inline-flex text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors'
									>
										Админ
									</Link>
								)}
								<button
									onClick={() => navigate('/my-appointments')}
									className='hidden sm:inline-flex text-xs px-3 py-1.5 border border-gray-200 rounded-full text-gray-600 hover:border-pink-300 hover:text-pink-600 transition-colors'
								>
									{user.name.split(' ')[0]}
								</button>
								<button
									onClick={logout}
									className='hidden sm:inline-flex text-xs px-3 py-1.5 text-gray-400 hover:text-red-500 transition-colors'
								>
									{t('auth.logout')}
								</button>
							</div>
						) : (
							<button
								onClick={() => setAuthOpen(true)}
								className='hidden sm:inline-flex text-sm px-4 py-1.5 border border-gray-200 rounded-full text-gray-600 hover:border-pink-400 hover:text-pink-600 transition-colors'
							>
								{t('auth.login')}
							</button>
						)}

						{user ? (
							<>
								{/* Desktop: обычная кнопка "Записаться" */}
								<button
									onClick={() => setBookOpen(true)}
									className='hidden sm:inline-flex text-sm px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition-all hover:shadow-md hover:shadow-pink-200 active:scale-95'
								>
									{t('home.book_btn')}
								</button>
								{/* Mobile: иконка профиля вместо "Записаться" */}
								<button
									onClick={() => navigate('/my-appointments')}
									aria-label='Профиль'
									className='sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors active:scale-95'
								>
									<svg viewBox='0 0 24 24' className='w-5 h-5 fill-current'>
										<path d='M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z' />
									</svg>
								</button>
							</>
						) : (
							<button
								onClick={() => setAuthOpen(true)}
								className='text-sm px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition-all hover:shadow-md hover:shadow-pink-200 active:scale-95'
							>
								<span className='hidden sm:inline'>{t('home.book_btn')}</span>
								<span className='sm:hidden'>✦</span>
							</button>
						)}
					</div>
				</div>
			</header>

			{/* Mobile side menu */}
			<div
				className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
			>
				<div
					className={`absolute inset-0 bg-black transition-opacity duration-300 ${menuOpen ? 'opacity-50' : 'opacity-0'}`}
					onClick={closeMenu}
				/>
				<div
					className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
				>
					<div className='p-5 border-b border-gray-100 flex items-center justify-between'>
						<Link
							to='/home'
							onClick={closeMenu}
							className='text-xl font-bold'
							style={{ fontFamily: 'Georgia, serif' }}
						>
							<span className='text-gray-800'>Kerri</span>
							<span className='text-pink-500'> Nails</span>
						</Link>
						<button
							onClick={closeMenu}
							className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
						>
							×
						</button>
					</div>

					<nav className='flex-1 p-5 flex flex-col gap-1'>
						{navLinks.map(l => (
							<Link
								key={l.to}
								to={l.to}
								onClick={closeMenu}
								className='py-3 px-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium transition-colors'
							>
								{l.label}
							</Link>
						))}
					</nav>

					<div className='p-5 border-t border-gray-100 space-y-3'>
						<a
							href='tel:+79992488379'
							className='flex items-center gap-2 text-gray-600 text-sm'
						>
							📞 +7 (999) 248-83-79
						</a>
						{user ? (
							<div className='flex flex-col gap-2'>
								<button
									onClick={() => {
										navigate('/my-appointments')
										closeMenu()
									}}
									className='flex items-center gap-2 text-sm text-gray-700 font-medium hover:text-pink-600 transition-colors text-left'
								>
									👤 {user.name} · Профиль
								</button>
								<button
									onClick={() => {
										logout()
										closeMenu()
									}}
									className='text-sm text-red-500 text-left'
								>
									Выйти
								</button>
							</div>
						) : (
							<button
								onClick={() => {
									setAuthOpen(true)
									closeMenu()
								}}
								className='w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors'
							>
								{t('auth.login')} / {t('auth.register')}
							</button>
						)}
						<button
							onClick={() => {
								user ? setBookOpen(true) : setAuthOpen(true)
								closeMenu()
							}}
							className='w-full py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors'
						>
							{t('home.book_btn')}
						</button>
					</div>
				</div>
			</div>

			{authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
			{bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
		</>
	)
}
