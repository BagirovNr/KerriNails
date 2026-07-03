import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaInstagram, FaTelegram, FaWhatsapp } from 'react-icons/fa6'
import { FaVk } from 'react-icons/fa'
import { SOCIAL_LINKS } from '../../utils/social'

const SOCIALS = [
	{
		name: 'Instagram',
		href: SOCIAL_LINKS.instagram,
		Icon: FaInstagram,
		hoverBg: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500',
	},
	{
		name: 'Telegram',
		href: SOCIAL_LINKS.telegram,
		Icon: FaTelegram,
		hoverBg: 'hover:bg-[#26A5E4]',
	},
	{
		name: 'WhatsApp',
		href: SOCIAL_LINKS.whatsapp,
		Icon: FaWhatsapp,
		hoverBg: 'hover:bg-[#25D366]',
	},
	{
		name: 'VK',
		href: SOCIAL_LINKS.vk,
		Icon: FaVk,
		hoverBg: 'hover:bg-[#0077FF]',
	},
]

export default function Footer() {
	const { t } = useTranslation()
	return (
		<footer className='bg-gray-900 text-gray-400 pt-12 pb-6 px-4 mt-auto'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8'>
					<div>
						<div
							className='text-xl font-bold mb-3'
							style={{ fontFamily: 'Georgia, serif' }}
						>
							<span className='text-white'>Kerri</span>
							<span className='text-pink-400'> Nails</span>
						</div>
						<p className='text-sm leading-relaxed mb-4'>
							Премиальный маникюрный салон в Санкт-Петербурге. Работаем с 2020
							года.
						</p>
						{/* Соцсети */}
						<div className='flex gap-2'>
							{SOCIALS.map(({ name, href, Icon, hoverBg }) => {
								const disabled = !href
								return (
									<a
										key={name}
										href={disabled ? undefined : href}
										target='_blank'
										rel='noopener noreferrer'
										aria-label={name}
										title={
											disabled ? `${name} — ссылка ещё не настроена` : name
										}
										aria-disabled={disabled}
										className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors ${
											disabled
												? 'opacity-40 cursor-not-allowed'
												: `${hoverBg} hover:text-white cursor-pointer`
										}`}
										onClick={e => disabled && e.preventDefault()}
									>
										<Icon className='text-base' />
									</a>
								)
							})}
						</div>
					</div>
					<div>
						<h4 className='text-white font-semibold mb-3 text-sm uppercase tracking-wide'>
							Навигация
						</h4>
						<div className='flex flex-col gap-2 text-sm'>
							{[
								['Главная', '/home'],
								['Услуги', '/services'],
								['Портфолио', '/portfolio'],
								['Цены', '/prices'],
								['Контакты', '/contact'],
							].map(([l, p]) => (
								<Link
									key={p}
									to={p}
									className='hover:text-pink-400 transition-colors'
								>
									{l}
								</Link>
							))}
						</div>
					</div>
					<div>
						<h4 className='text-white font-semibold mb-3 text-sm uppercase tracking-wide'>
							Контакты
						</h4>
						<div className='flex flex-col gap-2 text-sm'>
							<a
								href='tel:+79992488379'
								className='hover:text-pink-400 transition-colors'
							>
								+7 (999) 248-83-79
							</a>
							<a
								href='https://yandex.ru/maps/org/kerii_nailss/109264447499/'
								target='_blank'
								rel='noopener noreferrer'
								className='hover:text-pink-400 transition-colors'
							>
								Всеволожский пр., 7
							</a>
							<span className='text-gray-500 text-xs mt-1'>
								Пн–Сб: 10:00–20:00
							</span>
							<span className='text-gray-500 text-xs'>Вс: 11:00–18:00</span>
						</div>
					</div>
				</div>
				<div className='border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs'>
					<span>
						© {new Date().getFullYear()} Kerri Nails. {t('footer.rights')}.
					</span>
					<Link to='/privacy' className='hover:text-pink-400 transition-colors'>
						{t('footer.privacy')}
					</Link>
				</div>
			</div>
		</footer>
	)
}
