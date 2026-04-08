import React, { useState } from 'react'
import image1 from '../../assets/nails.jpg'
import image2 from '../../assets/nails2.jpg'
import image3 from '../../assets/nails3.jpg'
import { useTranslation } from 'react-i18next'

const Carousel = () => {
	const { t } = useTranslation()

	const images = [
		{
			src: image1,
			alt: 'Дизайн ногтей 1',
			title: t('carousel.slide1.title'),
			pin: '✨',
			discount: t('carousel.slide1.discount'),
			description: t('carousel.slide1.description'),
		},
		{
			src: image2,
			alt: 'Дизайн ногтей 2',
			title: t('carousel.slide2.title'),
			pin: '💎',
			discount: t('carousel.slide2.discount'),
			description: t('carousel.slide2.description'),
		},
		{ src: image3, alt: 'Логотип студии' },
	]

	const [currentIndex, setCurrentIndex] = useState(0)

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

	const goToSlide = (index: React.SetStateAction<number>) => {
		setCurrentIndex(index)
	}

	return (
		<div className='relative w-full max-w-7xl mx-auto overflow-hidden rounded-2xl'>
			<div
				className='flex transition-transform duration-500 ease-in-out'
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
			>
				{images.map((image, index) => (
					<div key={index} className='w-full shrink-0 px-4 sm:px-6 lg:px-8'>
						<div className='flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8 h-full'>
							{/* Блок с текстом */}
							<div className='w-full  ml-5  lg:w-2/3 flex flex-col justify-center items-center lg:items-start lg:mt-0 mt-10'>
								<div className=' bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-4  sm:p-6 lg:p-8 shadow-md border border-purple-100 max-w-lg mx-auto lg:mx-0'>
									<p className='text-base sm:text-lg font-semibold text-purple-600 mb-2 text-center lg:text-left'>
										{image.pin} {image.title}
									</p>
									<p className='text-2xl sm:text-3xl font-black text-gradient bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-pink-600 mb-3 text-center lg:text-left'>
										{image.discount}
									</p>
									<p className='text-sm sm:text-base text-gray-700 text-center lg:text-left leading-relaxed'>
										{image.description}
									</p>
								</div>
							</div>

							{/* Блок с изображением */}
							<div className='w-full lg:w-1/3 flex justify-center'>
								<div className='relative max-w-75 w-full'>
									<img
										src={image.src}
										alt={image.alt}
										className='w-full h-auto object-cover rounded-xl shadow-lg max-h-100'
									/>
									<div className='relative bottom-5 left-13	w-23 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm  font-medium shadow-md xl:left-1/2 text-center'>
										<p>{t('common.new')}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Кнопки навигации */}
			<button
				onClick={goToPrev}
				className='absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-xl hover:bg-purple-100 transition-all duration-300 z-10'
				aria-label='Предыдущий слайд'
			>
				<svg
					className='w-5 h-5 sm:w-6 sm:h-6 text-purple-600'
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
				className='absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-xl hover:bg-purple-100 transition-all duration-300 z-10'
				aria-label='Следующий слайд'
			>
				<svg
					className='w-5 h-5 sm:w-6 sm:h-6 text-purple-600'
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
