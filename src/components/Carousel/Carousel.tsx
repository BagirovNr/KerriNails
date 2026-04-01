import React, { useState } from 'react'

// Импортируем изображения
import image1 from '../../assets/nails.jpg'
import image2 from '../../assets/nails2.jpg'
import image3 from '../../assets/nails3.jpg'

// Создаём массив объектов с изображениями и подписями
const images = [
	{
		src: image1,
		alt: 'Дизайн ногтей 1',
		title: 'ЭКСКЛЮЗИВНОЕ ПРЕДЛОЖЕНИЕ',
		pin: '✨',
		discount: '-25 % для новых клиентов!',
		description:
			'Только сейчас и только для вас — специальная скидка на все услуги студии!',
	},
	{
		src: image2,
		alt: 'Дизайн ногтей 1',
		title: 'Эксклюзивное предложение для своих',
		pin: '💎',
		discount: 'Бонус 500 руб.',
		description:
			'Ваши друзья выбирают красоту — вы получаете благодарность! За каждого приглашённого друга — 500 рублей на счёт в студии. Создавайте свой круг красоты!',
	},
	{ src: image3, alt: 'Логотип студии' },
]

const Carousel = () => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const carouselRef = React.useRef(null)

	const goToNext = () => {
		setCurrentIndex(prevIndex =>
			prevIndex === images.length - 1 ? 0 : prevIndex + 1,
		)
	}

	const goToPrev = () => {
		setCurrentIndex(prevIndex =>
			prevIndex === 0 ? images.length - 1 : prevIndex - 1,
		)
	}

	const goToSlide = index => {
		setCurrentIndex(index)
	}

	return (
		<div className='relative w-full  mx-auto overflow-hidden rounded-2xl'>
			<div
				ref={carouselRef}
				className='flex transition-transform duration-500 ease-in-out'
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
			>
				{images.map((image, index) => (
					<div
						key={index}
						className='w-full flex-shrink-0 flex justify-between px-20 shadow-lg bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-4'
					>
						{/* Блок с текстом — 70 % ширины, красивый фон */}
						<div className='w-3/4 flex flex-col justify-center items-center '>
							<div className='bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-purple-100'>
								<p className='text-lg font-semibold text-purple-600 mb-2 text-center'>
									{image.pin} {image.title}
								</p>
								<p className='text-3xl font-black text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-3 text-center'>
									{image.discount}
								</p>
								<p className='text-base text-gray-700 text-center leading-relaxed'>
									{image.description}
								</p>
							</div>
						</div>

						{/* Блок с изображением — 30 % ширины */}
						<div className='w-1/7  flex items-center '>
							<div className='relative'>
								<img
									src={image.src}
									alt={image.alt}
									className='h-full w-full object-cover rounded-xl shadow-lg'
								/>
								<div className='absolute -bottom-4 left-0 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md'>
									Новинка!
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Кнопки навигации */}
			<button
				onClick={goToPrev}
				className='absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-purple-100 transition-all duration-300 z-10'
			>
				<svg
					className='w-6 h-6 text-purple-600'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M15 19l-7-7 7-7'
					/>
				</svg>
			</button>
			<button
				onClick={goToNext}
				className='absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-purple-100 transition-all duration-300 z-10'
			>
				<svg
					className='w-6 h-6 text-purple-600'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M9 5l7 7-7 7'
					/>
				</svg>
			</button>

			{/* Индикаторы */}
			<div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3'>
				{images.map((_, index) => (
					<button
						key={index}
						onClick={() => goToSlide(index)}
						className={`w-3 h-3 rounded-full transition-all duration-300 ${
							currentIndex === index
								? 'bg-purple-600 scale-125'
								: 'bg-white bg-opacity-50 hover:bg-purple-300'
						}`}
					/>
				))}
			</div>
		</div>
	)
}

export default Carousel
