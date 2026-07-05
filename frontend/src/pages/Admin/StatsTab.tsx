import { useAdminData } from '../../hooks/useAdminData'

export default function StatsTab() {
	const { stats } = useAdminData()
	if (!stats) return null

	const cards = [
		{ label: 'Всего записей', value: stats.total, color: 'bg-gray-50' },
		{ label: 'Ожидают', value: stats.pending, color: 'bg-yellow-50' },
		{ label: 'Подтверждены', value: stats.confirmed, color: 'bg-green-50' },
		{ label: 'Завершены', value: stats.completed, color: 'bg-blue-50' },
		{ label: 'Отменены', value: stats.cancelled, color: 'bg-red-50' },
		{ label: 'Клиентов', value: stats.totalClients, color: 'bg-purple-50' },
	]

	return (
		<div>
			{/* Мобильные и планшеты: горизонтальная лента карточек со скроллом, чтобы ни одна метрика не обрезалась */}
			<div className='flex sm:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory'>
				{cards.map(s => (
					<div
						key={s.label}
						className={`${s.color} rounded-2xl p-5 text-center shrink-0 w-36 snap-start`}
					>
						<p className='text-3xl font-bold text-gray-800 mb-1'>{s.value}</p>
						<p className='text-xs text-gray-500'>{s.label}</p>
					</div>
				))}
			</div>

			{/* Десктоп/планшет: обычная сетка */}
			<div className='hidden sm:grid grid-cols-3 md:grid-cols-6 gap-4'>
				{cards.map(s => (
					<div key={s.label} className={`${s.color} rounded-2xl p-5 text-center`}>
						<p className='text-3xl font-bold text-gray-800 mb-1'>{s.value}</p>
						<p className='text-xs text-gray-500'>{s.label}</p>
					</div>
				))}
			</div>
		</div>
	)
}
