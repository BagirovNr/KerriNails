import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAdminData } from '../../hooks/useAdminData'

export default function StatsTab() {
	const { stats } = useAdminData()
	const gridRef = useRef<HTMLDivElement>(null)

	const cards = stats
		? [
				{
					label: 'Всего записей',
					value: stats.total,
					icon: '📋',
					accent: 'text-pink-400 bg-pink-500/10',
				},
				{
					label: 'Ожидают',
					value: stats.pending,
					icon: '⏳',
					accent: 'text-yellow-300 bg-yellow-500/10',
				},
				{
					label: 'Подтверждены',
					value: stats.confirmed,
					icon: '✅',
					accent: 'text-green-300 bg-green-500/10',
				},
				{
					label: 'Завершены',
					value: stats.completed,
					icon: '🏁',
					accent: 'text-blue-300 bg-blue-500/10',
				},
				{
					label: 'Отменены',
					value: stats.cancelled,
					icon: '✕',
					accent: 'text-red-400 bg-red-500/10',
				},
				{
					label: 'Клиентов',
					value: stats.totalClients,
					icon: '👥',
					accent: 'text-purple-300 bg-purple-500/10',
				},
			]
		: []

	useGSAP(
		() => {
			if (!stats) return
			gsap.from('.stat-card', {
				opacity: 0,
				y: 16,
				duration: 0.45,
				stagger: 0.07,
				ease: 'power2.out',
			})
		},
		{ scope: gridRef, dependencies: [stats] },
	)

	if (!stats) return null

	return (
		<div ref={gridRef}>
			<h2 className='text-lg font-semibold text-gray-100 mb-5'>Статистика</h2>

			{/* Мобильные и планшеты: горизонтальная лента карточек со скроллом, чтобы ни одна метрика не обрезалась */}
			<div className='flex sm:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory'>
				{cards.map(s => (
					<div
						key={s.label}
						className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5 shrink-0 w-40 snap-start'
					>
						<div
							className={`w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 ${s.accent}`}
						>
							{s.icon}
						</div>
						<p className='text-3xl font-bold text-gray-100 mb-1'>{s.value}</p>
						<p className='text-xs text-gray-500'>{s.label}</p>
					</div>
				))}
			</div>

			{/* Десктоп/планшет: обычная сетка */}
			<div className='hidden sm:grid grid-cols-3 md:grid-cols-6 gap-4'>
				{cards.map(s => (
					<div
						key={s.label}
						className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors'
					>
						<div
							className={`w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 ${s.accent}`}
						>
							{s.icon}
						</div>
						<p className='text-3xl font-bold text-gray-100 mb-1'>{s.value}</p>
						<p className='text-xs text-gray-500'>{s.label}</p>
					</div>
				))}
			</div>
		</div>
	)
}
