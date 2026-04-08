// components/Header/Header.jsx
import { Link } from 'react-router-dom'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

function Header() {
	const { t } = useTranslation()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	// Закрытие меню при клике на ссылку
	const handleLinkClick = () => setIsMobileMenuOpen(false)

	return (
		<header className='fixed top-0 w-full bg-white shadow-md z-50'>
			<div className='container mx-auto px-4'>
				{/* Основная строка навигации */}
				<div className='flex justify-between items-center py-4'>
					<Link
						to='/home'
						className='text-xl sm:text-2xl font-bold text-pink-600 whitespace-nowrap'
						aria-label='Главная страница'
					>
						Nail Studio
					</Link>

					{/* Десктопная навигация */}
					<nav className='hidden md:flex items-center gap-6'>
						<Link
							to='/discount'
							className='text-sm sm:text-base text-pink-500 hover:text-pink-700 transition-colors'
						>
							{t('discountText')}
						</Link>
						<a
							href='tel:+79992488379'
							className='text-base sm:text-lg text-gray-700 hover:text-pink-600 transition-colors whitespace-nowrap'
						>
							+7 (999) 248-83-79
						</a>
						<a
							href='https://yandex.ru/maps/10865/vsevolgsk/house/vsevolozhskiy_prospekt_7/Z0kYcANmT0cPQFhqfXxzc3tkZw==/?ll=30.646628%2C60.022774&z=16.67'
							target='_blank'
							rel='noopener noreferrer'
							className='text-xs sm:text-sm text-gray-600 hover:text-pink-600 underline whitespace-nowrap'
						>
							Всеволожский проспект, 7
						</a>
						<LanguageSwitcher />
					</nav>

					{/* Мобильное меню (бургер) */}
					<button
						className='md:hidden p-2'
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-expanded={isMobileMenuOpen}
						aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
					>
						<div className='w-6 h-0.5 bg-gray-600 mb-1'></div>
						<div className='w-6 h-0.5 bg-gray-600 mb-1'></div>
						<div className='w-6 h-0.5 bg-gray-600'></div>
					</button>
				</div>

				{/* Мобильная навигация (появляется при открытии) */}
				{isMobileMenuOpen && (
					<div className='md:hidden py-4 border-t border-gray-200'>
						<nav className='flex flex-col gap-4'>
							<Link
								to='/discount'
								className='text-lg text-pink-500'
								onClick={handleLinkClick}
							>
								{t('discountText')}
							</Link>
							<a
								href='tel:+79992488379'
								className='text-base text-gray-700'
								onClick={handleLinkClick}
							>
								+7 (999) 248-83-79
							</a>
							<a
								href='https://yandex.ru/maps/org/kerii_nailss/109264447499/?display-text=kerii%20nailss&ll=30.646628%2C60.022774&mode=search&sll=30.646628%2C60.022774&sspn=0.021801%2C0.006551&text=kerii%20nailss&z=16'
								target='_blank'
								rel='noopener noreferrer'
								className='text-sm text-gray-600'
								onClick={handleLinkClick}
							>
								Всеволожский проспект, 7
							</a>
							<div className='pt-2'>
								<LanguageSwitcher />
							</div>
						</nav>
					</div>
				)}
			</div>
		</header>
	)
}

export default Header
