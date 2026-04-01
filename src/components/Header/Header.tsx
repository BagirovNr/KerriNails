// components/Header/Header.jsx
import { Link } from 'react-router-dom'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

function Header() {
	const { t } = useTranslation()

	return (
		<header className='fixed top-0 w-full bg-white shadow-md z-50'>
			<div className='container mx-auto px-4 flex justify-between items-center py-4'>
				<nav className='flex items-center gap-4'>
					{/* Логотип */}
					<Link to='/' className='text-2xl font-bold text-pink-600'>
						Nail Studio
					</Link>
					{/* Текст скидки */}
					<Link to={'discount'}>
						<p className='text-sm text-pink'>{t('discountText')}</p>
					</Link>
				</nav>
				<div className='flex items-center gap-6'>
					{/* Контактные данные */}
					<a
						href='tel:+79052260282'
						className='text-lg text-gray-700 hover:text-pink-600 transition-colors'
					>
						8(905)226-02-82
					</a>
					<a
						href='https://yandex.ru/maps/10865/vsevolgsk/house/vsevolozhskiy_prospekt_7/Z0kYcANmT0cPQFhqfXxzc3tkZw==/?ll=30.646628%2C60.022774&z=16.67'
						target='_blank'
						rel='noopener noreferrer'
						className='text-sm text-gray-600 hover:text-pink-600 underline'
					>
						Всеволожский проспект, 7
					</a>
					{/* Переключатель языка */}
					<LanguageSwitcher />
				</div>
			</div>
		</header>
	)
}

export default Header
