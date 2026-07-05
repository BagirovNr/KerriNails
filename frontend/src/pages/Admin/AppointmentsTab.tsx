import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAdminData } from '../../hooks/useAdminData'

const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-500/15 text-yellow-300',
	confirmed: 'bg-green-500/15 text-green-300',
	cancelled: 'bg-red-500/15 text-red-400',
	completed: 'bg-blue-500/15 text-blue-300',
}

const STATUS_LABELS: Record<string, string> = {
	pending: 'Ожидает',
	confirmed: 'Подтверждено',
	completed: 'Завершено',
	cancelled: 'Отменено',
}

export default function AppointmentsTab() {
	const { appointments, stats, updateStatus } = useAdminData()
	const [filter, setFilter] = useState('all')
	const listRef = useRef<HTMLDivElement>(null)

	const filtered =
		filter === 'all'
			? appointments
			: appointments.filter(a => a.status === filter)

	useGSAP(
		() => {
			gsap.from('.appointment-card', {
				opacity: 0,
				y: 12,
				duration: 0.35,
				stagger: 0.05,
				ease: 'power2.out',
			})
		},
		{ scope: listRef, dependencies: [filter, filtered.length] },
	)

	return (
		<div ref={listRef}>
			<h2 className='text-lg font-semibold text-gray-100 mb-5'>Записи</h2>

			<div className='flex flex-wrap gap-2 mb-5'>
				{['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
							filter === f
								? 'bg-pink-500 text-white'
								: 'bg-gray-800 text-gray-300 hover:bg-gray-700'
						}`}
					>
						{f === 'all' ? 'Все' : STATUS_LABELS[f]}
						{f !== 'all' && stats && (
							<span className='ml-1 opacity-70'>
								({(stats as any)[f] ?? 0})
							</span>
						)}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className='text-center py-12 text-gray-500'>Нет записей</div>
			) : (
				<div className='flex flex-col gap-3'>
					{filtered.map(a => (
						<div
							key={a.id}
							className='appointment-card bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-5'
						>
							<div className='flex flex-col sm:flex-row sm:items-center gap-3'>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 flex-wrap'>
										<p className='font-semibold text-gray-100'>{a.userName}</p>
										<span
											className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-gray-800 text-gray-400'}`}
										>
											{STATUS_LABELS[a.status] || a.status}
										</span>
									</div>
									<p className='text-sm text-gray-400 mt-0.5'>{a.userEmail}</p>
									{a.userPhone && (
										<p className='text-sm text-pink-400 font-medium'>
											📞 {a.userPhone}
										</p>
									)}
									<p className='text-sm text-gray-200 mt-1 font-medium'>
										{a.service}
									</p>
									<p className='text-sm text-gray-500'>
										📅 {a.date} · ⏰ {a.time}
										{a.duration ? ` · ⏱ ${a.duration} ч` : ''}
									</p>
									{a.comment && (
										<p className='text-xs text-gray-500 mt-1 italic'>
											"{a.comment}"
										</p>
									)}
								</div>

								<div className='flex flex-wrap gap-2 shrink-0'>
									{a.status === 'pending' && (
										<button
											onClick={() => updateStatus(a.id, 'confirmed')}
											className='px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-colors'
										>
											✓ Принять
										</button>
									)}
									{(a.status === 'pending' || a.status === 'confirmed') && (
										<button
											onClick={() => updateStatus(a.id, 'completed')}
											className='px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors'
										>
											✓✓ Завершить
										</button>
									)}
									{a.status !== 'cancelled' && a.status !== 'completed' && (
										<button
											onClick={() => updateStatus(a.id, 'cancelled')}
											className='px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs rounded-lg font-medium transition-colors'
										>
											✕ Отменить
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
