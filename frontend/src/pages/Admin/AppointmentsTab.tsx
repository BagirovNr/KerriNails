import { useState } from 'react'
import { useAdminData } from '../../hooks/useAdminData'

const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-700',
	confirmed: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-600',
	completed: 'bg-blue-100 text-blue-700',
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

	const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

	return (
		<>
			<div className='flex flex-wrap gap-2 mb-5'>
				{['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
							filter === f ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						{f === 'all' ? 'Все' : STATUS_LABELS[f]}
						{f !== 'all' && stats && <span className='ml-1 opacity-70'>({(stats as any)[f] ?? 0})</span>}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className='text-center py-12 text-gray-400'>Нет записей</div>
			) : (
				<div className='flex flex-col gap-3'>
					{filtered.map(a => (
						<div key={a.id} className='bg-white rounded-2xl border border-gray-100 p-4 sm:p-5'>
							<div className='flex flex-col sm:flex-row sm:items-center gap-3'>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 flex-wrap'>
										<p className='font-semibold text-gray-800'>{a.userName}</p>
										<span
											className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-500'}`}
										>
											{STATUS_LABELS[a.status] || a.status}
										</span>
									</div>
									<p className='text-sm text-gray-500 mt-0.5'>{a.userEmail}</p>
									{a.userPhone && <p className='text-sm text-pink-600 font-medium'>📞 {a.userPhone}</p>}
									<p className='text-sm text-gray-700 mt-1 font-medium'>{a.service}</p>
									<p className='text-sm text-gray-400'>
										📅 {a.date} · ⏰ {a.time}
										{a.duration ? ` · ⏱ ${a.duration} ч` : ''}
									</p>
									{a.comment && <p className='text-xs text-gray-400 mt-1 italic'>"{a.comment}"</p>}
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
											className='px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg font-medium transition-colors'
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
		</>
	)
}
