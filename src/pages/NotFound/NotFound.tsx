// NotFoundPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NotFoundPage = () => {
	const { t } = useTranslation()

	const benefits = t('notFound.benefits', { returnObjects: true })

	return (
		<div className='min-h-screen bg-gradient-to-r from-pink-50 to-purple-100 flex flex-col items-center justify-center px-4 py-8'>
			{/* Декоративные элементы */}
			<div className='absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-50 animate-bounce'></div>
			<div className='absolute bottom-20 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-50 animate-pulse'></div>

			<div className='max-w-lg text-center'>
				{/* Заголовок с кодом ошибки */}
				<h1 className='text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-600 mb-4'>
					404
				</h1>

				{/* Основной текст — первая фраза */}
				<h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-4'>
					{t('notFound.title')}
				</h2>

				{/* Список преимуществ */}
				<div className='text-left mb-8'>
					<h3 className='text-xl font-semibold text-gray-700 mb-3'>
						{t('notFound.weHave')}
					</h3>
					<ul className='space-y-2'>
						{benefits.map((benefit, index) => (
							<li key={index} className='flex items-center text-gray-600'>
								<span
									className={`w-2 h-2 rounded-full mr-3 ${
										index % 2 === 0 ? 'bg-pink-400' : 'bg-purple-400'
									}`}
								></span>
								{benefit}
							</li>
						))}
					</ul>
				</div>

				{/* Кнопка */}
				<Link
					to='/'
					className='inline-block bg-gradient-to-r from-pink-500 to-red-600 text-white font-semibold py-3 px-8 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg'
				>
					{t('notFound.backToHome')}
				</Link>
			</div>
		</div>
	)
}

export default NotFoundPage
