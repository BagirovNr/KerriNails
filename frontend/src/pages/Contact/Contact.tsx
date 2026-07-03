import { useTranslation } from 'react-i18next'
import { SOCIAL_LINKS } from '../../utils/social'

export default function Contact() {
	const { t } = useTranslation()
	return (
		<div className='py-12 px-4 max-w-5xl mx-auto'>
			<h1
				className='text-4xl font-bold text-gray-800 mb-2 text-center'
				style={{ fontFamily: 'Georgia, serif' }}
			>
				{t('contact.title')}
			</h1>
			<p className='text-gray-400 text-center mb-10'>
				Всегда рады вашему визиту
			</p>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
				{/* Info cards */}
				<div className='flex flex-col gap-4'>
					{[
						{
							icon: '📞',
							label: t('contact.phone'),
							value: '+7 (999) 248-83-79',
							href: 'tel:+79992488379',
						},
						{
							icon: '📍',
							label: t('contact.address'),
							value: 'Всеволожский пр., 7, Санкт-Петербург',
							href: 'https://yandex.ru/maps/org/kerii_nailss/109264447499/',
						},
						{
							icon: '🕐',
							label: t('contact.hours'),
							value: t('contact.hours_value'),
							href: null,
						},
					].map(item => (
						<div
							key={item.label}
							className='bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow'
						>
							<div className='flex items-start gap-4'>
								<span className='text-2xl mt-0.5'>{item.icon}</span>
								<div>
									<p className='text-xs text-gray-400 font-medium uppercase tracking-wide mb-1'>
										{item.label}
									</p>
									{item.href ? (
										<a
											href={item.href}
											target={
												item.href.startsWith('http') ? '_blank' : undefined
											}
											rel='noopener noreferrer'
											className='font-semibold text-gray-800 hover:text-pink-500 transition-colors'
										>
											{item.value}
										</a>
									) : (
										<p className='font-semibold text-gray-800'>{item.value}</p>
									)}
								</div>
							</div>
						</div>
					))}

					{/* Social */}
					<div className='bg-pink-50 rounded-2xl p-5'>
						<p className='text-sm font-semibold text-gray-700 mb-3'>
							Мы в социальных сетях
						</p>
						<div className='flex gap-3'>
							{[
								{
									name: 'ВКонтакте',
									href: SOCIAL_LINKS.vk,
									color: 'bg-blue-500',
								},
								{
									name: 'Instagram',
									href: SOCIAL_LINKS.instagram,
									color: 'bg-gradient-to-br from-purple-500 to-pink-500',
								},
								{
									name: 'Telegram',
									href: SOCIAL_LINKS.telegram,
									color: 'bg-sky-500',
								},
								{
									name: 'WhatsApp',
									href: SOCIAL_LINKS.whatsapp,
									color: 'bg-[#25D366]',
								},
							].map(s => (
								<a
									key={s.name}
									href={s.href || undefined}
									target='_blank'
									rel='noopener noreferrer'
									onClick={e => !s.href && e.preventDefault()}
									className={`${s.color} text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity ${s.href ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'}`}
								>
									{s.name}
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Map embed placeholder */}
				<div className='bg-gray-100 rounded-2xl overflow-hidden h-80 md:h-auto flex items-center justify-center'>
					<a
						href='https://yandex.ru/maps/org/kerii_nailss/109264447499/'
						target='_blank'
						rel='noopener noreferrer'
						className='flex flex-col items-center gap-3 text-gray-500 hover:text-pink-500 transition-colors p-8 text-center'
					>
						<span className='text-5xl'>🗺️</span>
						<span className='font-medium'>Открыть на Яндекс Картах</span>
						<span className='text-sm text-gray-400'>Всеволожский пр., 7</span>
					</a>
				</div>
			</div>
		</div>
	)
}
