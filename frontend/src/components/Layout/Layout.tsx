import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { useAuth } from '../../hooks/useAuth'
import SideBanners from './SideBanners'

// Минималистичная ромашка — тонкие лепестки, контурный стиль
function Daisy({
	size = 80,
	opacity = 0.18,
	rotate = 0,
}: {
	size?: number
	opacity?: number
	rotate?: number
}) {
	const petalCount = 8
	const r = size / 2
	const petalW = r * 0.22
	const petalH = r * 0.45
	const petals = Array.from({ length: petalCount }, (_, i) => {
		const angle = (i / petalCount) * 360
		return (
			<ellipse
				key={i}
				cx={r}
				cy={petalH * 0.6}
				rx={petalW}
				ry={petalH}
				fill='none'
				stroke='#f472b6'
				strokeWidth='1.2'
				transform={`rotate(${angle} ${r} ${r})`}
			/>
		)
	})
	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			style={{
				transform: `rotate(${rotate}deg)`,
				opacity,
				display: 'block',
				overflow: 'visible',
			}}
		>
			{petals}
			{/* Центр */}
			<circle
				cx={r}
				cy={r}
				r={r * 0.14}
				fill='none'
				stroke='#f472b6'
				strokeWidth='1.2'
			/>
			<circle cx={r} cy={r} r={r * 0.06} fill='#f472b6' opacity={0.5} />
		</svg>
	)
}

export default function Layout({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth()
	const navigate = useNavigate()

	// Админ не должен видеть публичный сайт — всегда уводим его в панель управления
	useEffect(() => {
		if (!loading && user?.role === 'admin') navigate('/dashboard', { replace: true })
	}, [loading, user, navigate])

	return (
		<div
			className='min-h-screen flex flex-col overflow-x-hidden'
			style={{ position: 'relative' }}
		>
			<Header />

			<SideBanners />

			{/* Ромашки левая сторона */}
			<div
				style={{
					position: 'fixed',
					left: 0,
					top: '22%',
					zIndex: 40,
					pointerEvents: 'none',
					display: 'flex',
					flexDirection: 'column',
					gap: 32,
					padding: '0 0 0 8px',
				}}
			>
				<Daisy size={72} opacity={0.15} rotate={-15} />
				<Daisy size={44} opacity={0.1} rotate={20} />
			</div>

			{/* Ромашки правая сторона */}
			<div
				style={{
					position: 'fixed',
					right: 0,
					top: '45%',
					zIndex: 40,
					pointerEvents: 'none',
					display: 'flex',
					flexDirection: 'column',
					gap: 24,
					padding: '0 8px 0 0',
					alignItems: 'flex-end',
				}}
			>
				<Daisy size={52} opacity={0.11} rotate={30} />
				<Daisy size={76} opacity={0.14} rotate={-10} />
			</div>

			<main className='flex-1 pt-[105px] md:pt-[130px]'>{children}</main>
			<Footer />
		</div>
	)
}
