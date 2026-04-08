import { Link } from 'react-router-dom'
function LandingPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4'>
			{/* Контейнер с кнопками */}
			<div className='bg-black/30 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl'>
				{/* Заголовок */}
				<h1 className='text-4xl md:text-6xl font-black text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight'>
					Kerri Nails
				</h1>

				{/* Сетка кнопок */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto'>
					{/* Кнопка Home */}
					<Link
						to='/home'
						className='group relative p-0.5 rounded-2xl overflow-hidden'
					>
						<div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 text-center font-semibold text-lg text-white hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20'>
							Главная страница
						</div>
					</Link>

					{/* Кнопка Цены */}
					<Link
						to='/prices'
						className='group relative p-0.5 rounded-2xl overflow-hidden'
					>
						<div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 text-center font-semibold text-lg text-white hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20'>
							Наши цены
						</div>
					</Link>

					{/* Кнопка Оставить отзыв */}
					<a
						href='https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true&display-text=kerii%20nailss&ll=30.646628%2C60.022774&mode=search&sll=30.646628%2C60.022774&sspn=0.021801%2C0.006551&text=kerii%20nailss&z=16'
						target='_blank'
						rel='noopener'
						className='group relative p-0.5 rounded-2xl overflow-hidden'
					>
						<div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 text-center font-semibold text-lg text-white hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20'>
							Оставить отзыв
						</div>
					</a>

					{/* Четвёртая кнопка-заглушка */}
					<div className='group relative p-0.5 rounded-2xl overflow-hidden'>
						<div className='absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 text-center font-semibold text-lg text-white hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 cursor-not-allowed opacity-70'>
							Скоро доступно
						</div>
					</div>
				</div>

				{/* Декоративный элемент внизу */}
				<div className='mt-12 text-center'>
					<p className='text-gray-400 text-sm font-medium'>
						Премиальный сервис маникюра в Санкт‑Петербурге
					</p>
				</div>
			</div>
		</div>
	)
}

export default LandingPage
