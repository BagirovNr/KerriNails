// Spotlight-карусель отзывов.
// Тёмный фон, одна крупная карточка в центре с плавным fade-переходом.
// Автопрокрутка каждые 5 секунд, стрелки и точки навигации.

import { useState, useEffect, useCallback } from 'react'

const REVIEWS = [
	{
		name: 'Анастасия К.',
		role: 'Постоянный клиент · 2 года',
		avatar: 'АК',
		hue: '#f9a8d4',
		text: 'Потрясающий результат! Мастер очень внимательна к деталям — маникюр держится уже 4 недели без единого скола. Такого качества я ещё не видела нигде.',
	},
	{
		name: 'Мария Л.',
		role: 'Клиент с 2023 года',
		avatar: 'МЛ',
		hue: '#c4b5fd',
		text: 'Пришла впервые и сразу стала постоянным клиентом. Атмосфера уютная, чай предложили, музыка приятная. Педикюр — просто огонь, буду рекомендовать всем подругам.',
	},
	{
		name: 'Елена В.',
		role: 'Клиент салона',
		avatar: 'ЕВ',
		hue: '#fca5a5',
		text: 'Делала наращивание и покрытие гель-лаком. Всё чисто, аккуратно, без запаха. Мастер посоветовала форму под мою руку — результат выглядит абсолютно идеально.',
	},
	{
		name: 'Дарья Н.',
		role: 'Клиент с 2024 года',
		avatar: 'ДН',
		hue: '#fdba74',
		text: 'Нашла через Instagram, не пожалела ни на секунду! Записалась онлайн за 5 минут, в день записи не пришлось ждать. Маникюр и педикюр — оба за 2 часа.',
	},
	{
		name: 'Ольга С.',
		role: 'Постоянный клиент · 3 года',
		avatar: 'ОС',
		hue: '#6ee7b7',
		text: 'Сделала маникюр на свадьбу дочери. Мастер предложила нежный дизайн с цветами — гости весь вечер спрашивали, кто делал ногти. Это был лучший комплимент!',
	},
	{
		name: 'Татьяна Р.',
		role: 'Клиент с 2022 года',
		avatar: 'ТР',
		hue: '#7dd3fc',
		text: 'Хожу сюда уже два года. Качество стабильное, цены адекватные, мастер всегда помнит мои предпочтения. Лучший салон в районе — это без вариантов.',
	},
]

const STAR_PATH =
	'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

export default function ReviewsCarousel() {
	const [active, setActive] = useState(0)
	const [fading, setFading] = useState(false)
	const [paused, setPaused] = useState(false)

	const goTo = useCallback((idx: number) => {
		setFading(true)
		setTimeout(() => {
			setActive((idx + REVIEWS.length) % REVIEWS.length)
			setFading(false)
		}, 220)
	}, [])

	const next = useCallback(() => goTo(active + 1), [active, goTo])
	const prev = useCallback(() => goTo(active - 1), [active, goTo])

	useEffect(() => {
		if (paused) return
		const t = setInterval(next, 5000)
		return () => clearInterval(t)
	}, [paused, next])

	const r = REVIEWS[active]

	return (
		<section
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			style={{
				background:
					'linear-gradient(135deg, #0f0a10 0%, #1a0f1e 50%, #110a15 100%)',
				padding: '80px 16px',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Размытый цветной blob за активной карточкой */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 400,
					height: 400,
					borderRadius: '50%',
					background: r.hue,
					opacity: 0.06,
					filter: 'blur(80px)',
					transition: 'background 0.6s ease',
					pointerEvents: 'none',
				}}
			/>

			{/* Декоративные линии */}
			<svg
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					opacity: 0.04,
					pointerEvents: 'none',
				}}
				preserveAspectRatio='none'
			>
				<line
					x1='0'
					y1='0'
					x2='100%'
					y2='100%'
					stroke='white'
					strokeWidth='1'
				/>
				<line
					x1='100%'
					y1='0'
					x2='0'
					y2='100%'
					stroke='white'
					strokeWidth='1'
				/>
			</svg>

			{/* Заголовок */}
			<div style={{ textAlign: 'center', marginBottom: 48 }}>
				<p
					style={{
						color: '#9d7dab',
						fontSize: 11,
						fontWeight: 600,
						letterSpacing: '0.15em',
						textTransform: 'uppercase',
						marginBottom: 10,
					}}
				>
					Отзывы клиентов
				</p>
				<h2
					style={{
						color: '#fff',
						fontSize: 'clamp(22px,4vw,30px)',
						fontWeight: 700,
						fontFamily: 'Georgia,serif',
						margin: 0,
					}}
				>
					Что говорят о нас
				</h2>
				{/* Звёзды-рейтинг */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 6,
						marginTop: 10,
					}}
				>
					<div style={{ display: 'flex', gap: 2 }}>
						{[1, 2, 3, 4, 5].map(i => (
							<svg
								key={i}
								style={{ width: 16, height: 16, fill: '#fbbf24' }}
								viewBox='0 0 20 20'
							>
								<path d={STAR_PATH} />
							</svg>
						))}
					</div>
					<span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>
						5.0
					</span>
					<span style={{ color: '#6b7280', fontSize: 12 }}>· 200+ отзывов</span>
				</div>
			</div>

			{/* Карточка */}
			<div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
				<div
					style={{
						opacity: fading ? 0 : 1,
						transform: fading ? 'translateY(8px)' : 'translateY(0)',
						transition: 'opacity 0.22s ease, transform 0.22s ease',
					}}
				>
					{/* Большая кавычка */}
					<div
						style={{
							fontSize: 120,
							lineHeight: 0.8,
							color: r.hue,
							opacity: 0.2,
							fontFamily: 'Georgia,serif',
							fontWeight: 900,
							marginBottom: 8,
							paddingLeft: 8,
							userSelect: 'none',
						}}
					>
						❝
					</div>

					{/* Текст отзыва */}
					<p
						style={{
							color: '#e5e7eb',
							fontSize: 'clamp(15px,2.5vw,18px)',
							lineHeight: 1.75,
							fontStyle: 'italic',
							fontFamily: 'Georgia, serif',
							marginBottom: 36,
							paddingLeft: 8,
						}}
					>
						{r.text}
					</p>

					{/* Автор */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							paddingLeft: 8,
						}}
					>
						{/* Аватар */}
						<div
							style={{
								width: 48,
								height: 48,
								borderRadius: '50%',
								background: `linear-gradient(135deg, ${r.hue}cc, ${r.hue}44)`,
								border: `1.5px solid ${r.hue}66`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#fff',
								fontWeight: 700,
								fontSize: 13,
								flexShrink: 0,
								boxShadow: `0 0 16px ${r.hue}33`,
							}}
						>
							{r.avatar}
						</div>
						<div>
							<p
								style={{
									color: '#f9fafb',
									fontWeight: 600,
									fontSize: 15,
									margin: 0,
								}}
							>
								{r.name}
							</p>
							<p style={{ color: '#6b7280', fontSize: 12, margin: '2px 0 0' }}>
								{r.role}
							</p>
						</div>
						{/* Линия справа */}
						<div
							style={{
								flex: 1,
								height: 1,
								background: `linear-gradient(to right, ${r.hue}44, transparent)`,
								marginLeft: 8,
							}}
						/>
						{/* Звёзды у автора */}
						<div style={{ display: 'flex', gap: 1 }}>
							{[1, 2, 3, 4, 5].map(i => (
								<svg
									key={i}
									style={{ width: 12, height: 12, fill: '#fbbf24' }}
									viewBox='0 0 20 20'
								>
									<path d={STAR_PATH} />
								</svg>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Навигация */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 20,
					marginTop: 48,
				}}
			>
				{/* Стрелка влево */}
				<button
					onClick={prev}
					style={{
						width: 40,
						height: 40,
						borderRadius: '50%',
						border: '1px solid rgba(255,255,255,0.12)',
						background: 'rgba(255,255,255,0.05)',
						color: 'rgba(255,255,255,0.6)',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transition: 'all 0.2s',
						backdropFilter: 'blur(4px)',
					}}
				>
					<svg
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
					>
						<path d='M15 18l-6-6 6-6' />
					</svg>
				</button>

				{/* Точки */}
				<div style={{ display: 'flex', gap: 8 }}>
					{REVIEWS.map((_, i) => (
						<button
							key={i}
							onClick={() => goTo(i)}
							style={{
								width: i === active ? 24 : 6,
								height: 6,
								borderRadius: 100,
								background:
									i === active ? REVIEWS[i].hue : 'rgba(255,255,255,0.2)',
								border: 'none',
								cursor: 'pointer',
								padding: 0,
								transition: 'all 0.3s ease',
								boxShadow:
									i === active ? `0 0 8px ${REVIEWS[i].hue}88` : 'none',
							}}
						/>
					))}
				</div>

				{/* Стрелка вправо */}
				<button
					onClick={next}
					style={{
						width: 40,
						height: 40,
						borderRadius: '50%',
						border: '1px solid rgba(255,255,255,0.12)',
						background: 'rgba(255,255,255,0.05)',
						color: 'rgba(255,255,255,0.6)',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transition: 'all 0.2s',
						backdropFilter: 'blur(4px)',
					}}
				>
					<svg
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
					>
						<path d='M9 18l6-6-6-6' />
					</svg>
				</button>
			</div>

			{/* CTA */}
			<div style={{ textAlign: 'center', marginTop: 36 }}>
				<a
					href='https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true'
					target='_blank'
					rel='noopener noreferrer'
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 8,
						padding: '10px 22px',
						borderRadius: 100,
						border: '1px solid rgba(255,255,255,0.12)',
						color: 'rgba(255,255,255,0.55)',
						fontSize: 12,
						background: 'rgba(255,255,255,0.04)',
						textDecoration: 'none',
						transition: 'all 0.2s',
						backdropFilter: 'blur(4px)',
					}}
				>
					<svg
						style={{ width: 12, height: 12, fill: '#fbbf24' }}
						viewBox='0 0 20 20'
					>
						<path d={STAR_PATH} />
					</svg>
					Оставить отзыв на Яндексе
				</a>
			</div>
		</section>
	)
}
