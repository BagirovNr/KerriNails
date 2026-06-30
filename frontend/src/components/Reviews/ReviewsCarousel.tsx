// Карусель отзывов — два ряда, бесконечная прокрутка в разные стороны.
// При наведении анимация останавливается, чтобы можно было почитать.

const REVIEWS = [
	{
		name: 'Анастасия К.',
		avatar: 'А',
		color: 'bg-pink-400',
		text: 'Потрясающий результат! Мастер очень внимательна к деталям, маникюр держится уже 4 недели без сколов. Обязательно вернусь!',
	},
	{
		name: 'Мария Л.',
		avatar: 'М',
		color: 'bg-purple-400',
		text: 'Пришла впервые и сразу стала постоянным клиентом. Атмосфера уютная, чай предложили, музыка приятная. Педикюр — просто огонь 🔥',
	},
	{
		name: 'Елена В.',
		avatar: 'Е',
		color: 'bg-rose-400',
		text: 'Делала наращивание и покрытие гель-лаком. Всё чисто, аккуратно, без запаха. Мастер посоветовала форму под мою руку — выглядит идеально.',
	},
	{
		name: 'Дарья Н.',
		avatar: 'Д',
		color: 'bg-orange-400',
		text: 'Нашла через Instagram, не пожалела! Записалась онлайн за 5 минут, в день записи не пришлось ждать. Маникюр + педикюр за 2 часа.',
	},
	{
		name: 'Ольга С.',
		avatar: 'О',
		color: 'bg-emerald-400',
		text: 'Сделала маникюр на свадьбу дочери. Мастер предложила дизайн с нежными цветами — гости весь вечер спрашивали, кто делал ногти!',
	},
	{
		name: 'Татьяна Р.',
		avatar: 'Т',
		color: 'bg-sky-400',
		text: 'Хожу сюда уже год. Качество стабильное, цены адекватные, мастер помнит мои предпочтения. Лучший салон в районе без вариантов.',
	},
	{
		name: 'Алина М.',
		avatar: 'А',
		color: 'bg-fuchsia-400',
		text: 'Попробовала дизайн с втиркой — очень понравилось! Мастер показала несколько вариантов, помогла выбрать. Покрытие держится идеально.',
	},
	{
		name: 'Юлия П.',
		avatar: 'Ю',
		color: 'bg-teal-400',
		text: 'Пришла с подругой, обеим понравилось! Оформление салона приятное, всё стерильно. Записались уже на следующий месяц заранее.',
	},
]

// Дублируем массив для бесконечного скролла
const ROW1 = [...REVIEWS, ...REVIEWS]
const ROW2 = [
	...REVIEWS.slice(4),
	...REVIEWS.slice(0, 4),
	...REVIEWS.slice(4),
	...REVIEWS.slice(0, 4),
]

function Stars() {
	return (
		<div className='flex gap-0.5 mb-2'>
			{[1, 2, 3, 4, 5].map(i => (
				<svg
					key={i}
					className='w-4 h-4 text-yellow-400 fill-yellow-400'
					viewBox='0 0 20 20'
				>
					<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
				</svg>
			))}
		</div>
	)
}

function ReviewCard({ r }: { r: (typeof REVIEWS)[0] }) {
	return (
		<div className='flex-shrink-0 w-72 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mx-3 select-none'>
			<Stars />
			<p className='text-gray-600 text-sm leading-relaxed mb-4'>"{r.text}"</p>
			<div className='flex items-center gap-3'>
				<div
					className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
				>
					{r.avatar}
				</div>
				<div>
					<p className='font-semibold text-gray-800 text-sm'>{r.name}</p>
					<p className='text-gray-400 text-xs'>Клиент салона</p>
				</div>
				<div className='ml-auto'>
					<svg
						className='w-5 h-5 text-yellow-400 fill-yellow-400 opacity-30'
						viewBox='0 0 20 20'
					>
						<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
					</svg>
				</div>
			</div>
		</div>
	)
}

export default function ReviewsCarousel() {
	return (
		<section className='py-16 bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden'>
			<div className='max-w-6xl mx-auto px-4 mb-10 text-center'>
				<span className='inline-block px-3 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full mb-3 tracking-wide uppercase'>
					Отзывы клиентов
				</span>
				<h2
					className='text-3xl font-bold text-gray-800'
					style={{ fontFamily: 'Georgia, serif' }}
				>
					Нас любят и доверяют
				</h2>
				<div className='flex items-center justify-center gap-2 mt-3'>
					<div className='flex'>
						{[1, 2, 3, 4, 5].map(i => (
							<svg
								key={i}
								className='w-5 h-5 text-yellow-400 fill-yellow-400'
								viewBox='0 0 20 20'
							>
								<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
							</svg>
						))}
					</div>
					<span className='font-bold text-gray-800 text-lg'>5.0</span>
					<span className='text-gray-400 text-sm'>
						· 200+ отзывов на Яндексе
					</span>
				</div>
			</div>

			{/* Ряд 1 — вправо */}
			<div className='relative mb-4'>
				{/* Градиентные маски по краям */}
				<div className='absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-pink-50 via-pink-50/80 to-transparent pointer-events-none' />
				<div className='absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-rose-50 via-rose-50/80 to-transparent pointer-events-none' />
				<div className='flex animate-marquee'>
					{ROW1.map((r, i) => (
						<ReviewCard key={i} r={r} />
					))}
				</div>
			</div>

			{/* Ряд 2 — влево */}
			<div className='relative'>
				<div className='absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none' />
				<div className='absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-pink-50 via-pink-50/80 to-transparent pointer-events-none' />
				<div className='flex animate-marquee-reverse'>
					{ROW2.map((r, i) => (
						<ReviewCard key={i} r={r} />
					))}
				</div>
			</div>

			{/* Кнопка "Оставить отзыв" */}
			<div className='text-center mt-10'>
				<a
					href='https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true'
					target='_blank'
					rel='noopener noreferrer'
					className='inline-flex items-center gap-2 px-6 py-3 border border-pink-200 hover:border-pink-400 text-pink-600 hover:text-pink-700 rounded-full font-medium text-sm transition-all hover:shadow-md hover:shadow-pink-100 bg-white'
				>
					<svg className='w-4 h-4 fill-yellow-400' viewBox='0 0 20 20'>
						<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
					</svg>
					Оставить отзыв на Яндексе
				</a>
			</div>
		</section>
	)
}
