import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'

interface Appointment {
	id: string
	userName: string
	userEmail: string
	userPhone: string
	service: string
	services?: string[]
	date: string
	time: string
	comment: string
	status: string
	duration?: number
	createdAt: string
}

interface Stats {
	total: number
	pending: number
	confirmed: number
	completed: number
	cancelled: number
	totalClients: number
}

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

// ─── Утилиты для календаря ────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
	// 0=вс → делаем пн=0
	return (new Date(year, month, 1).getDay() + 6) % 7
}

const MONTH_NAMES = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]
const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// ─── Компонент вкладки Календарь ─────────────────────────────────────────────

function CalendarTab({ appointments }: { appointments: Appointment[] }) {
	const now = new Date()
	const [year, setYear] = useState(now.getFullYear())
	const [month, setMonth] = useState(now.getMonth())
	const [selectedDate, setSelectedDate] = useState<string | null>(null)

	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfMonth(year, month)
	const todayStr = now.toISOString().split('T')[0]

	// Группируем записи по дате
	const byDate: Record<string, Appointment[]> = {}
	appointments.forEach(a => {
		if (a.status === 'cancelled') return
		if (!byDate[a.date]) byDate[a.date] = []
		byDate[a.date].push(a)
	})

	const prevMonth = () => {
		if (month === 0) {
			setYear(y => y - 1)
			setMonth(11)
		} else setMonth(m => m - 1)
	}
	const nextMonth = () => {
		if (month === 11) {
			setYear(y => y + 1)
			setMonth(0)
		} else setMonth(m => m + 1)
	}

	const dayAppts = selectedDate ? byDate[selectedDate] || [] : []

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			{/* Календарь */}
			<div className='flex-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm'>
				{/* Навигация месяца */}
				<div className='flex items-center justify-between mb-4'>
					<button
						onClick={prevMonth}
						className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors'
					>
						‹
					</button>
					<span className='font-semibold text-gray-800'>
						{MONTH_NAMES[month]} {year}
					</span>
					<button
						onClick={nextMonth}
						className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors'
					>
						›
					</button>
				</div>

				{/* Дни недели */}
				<div className='grid grid-cols-7 mb-1'>
					{DAY_NAMES.map(d => (
						<div
							key={d}
							className={`text-center text-xs font-medium py-1 ${d === 'Сб' || d === 'Вс' ? 'text-pink-400' : 'text-gray-400'}`}
						>
							{d}
						</div>
					))}
				</div>

				{/* Дни */}
				<div className='grid grid-cols-7 gap-1'>
					{/* Пустые ячейки до начала месяца */}
					{Array.from({ length: firstDay }).map((_, i) => (
						<div key={`e${i}`} />
					))}

					{Array.from({ length: daysInMonth }).map((_, i) => {
						const day = i + 1
						const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
						const appts = byDate[dateStr] || []
						const isToday = dateStr === todayStr
						const isSelected = dateStr === selectedDate
						const hasAppts = appts.length > 0
						const isWeekend = (firstDay + i) % 7 >= 5

						return (
							<button
								key={day}
								onClick={() => setSelectedDate(isSelected ? null : dateStr)}
								className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                  ${
										isSelected
											? 'bg-pink-500 text-white shadow-md shadow-pink-200'
											: isToday
												? 'bg-pink-50 border-2 border-pink-300 text-pink-700'
												: hasAppts
													? 'bg-gray-50 hover:bg-pink-50 text-gray-800'
													: 'text-gray-400 hover:bg-gray-50'
									}
                  ${isWeekend && !isSelected && !isToday ? 'text-pink-400' : ''}
                `}
							>
								<span>{day}</span>
								{hasAppts && (
									<div
										className={`flex gap-0.5 mt-0.5 ${isSelected ? 'opacity-80' : ''}`}
									>
										{appts.slice(0, 3).map((a, idx) => (
											<div
												key={idx}
												className={`w-1 h-1 rounded-full ${
													isSelected
														? 'bg-white'
														: a.status === 'confirmed'
															? 'bg-green-400'
															: a.status === 'pending'
																? 'bg-yellow-400'
																: 'bg-blue-400'
												}`}
											/>
										))}
										{appts.length > 3 && (
											<span
												className={`text-[8px] leading-none ${isSelected ? 'text-white' : 'text-gray-400'}`}
											>
												+
											</span>
										)}
									</div>
								)}
							</button>
						)
					})}
				</div>

				{/* Легенда */}
				<div className='flex gap-4 mt-4 pt-4 border-t border-gray-100'>
					{[
						['bg-yellow-400', 'Ожидает'],
						['bg-green-400', 'Подтверждено'],
						['bg-blue-400', 'Завершено'],
					].map(([c, l]) => (
						<div
							key={l}
							className='flex items-center gap-1.5 text-xs text-gray-500'
						>
							<div className={`w-2 h-2 rounded-full ${c}`} />
							{l}
						</div>
					))}
				</div>
			</div>

			{/* Панель записей выбранного дня */}
			<div className='lg:w-80'>
				{selectedDate ? (
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm'>
						<h3 className='font-semibold text-gray-800 mb-1'>
							{new Date(selectedDate + 'T12:00:00').toLocaleDateString(
								'ru-RU',
								{ day: 'numeric', month: 'long' },
							)}
						</h3>
						<p className='text-xs text-gray-400 mb-4'>
							{dayAppts.length}{' '}
							{dayAppts.length === 1
								? 'запись'
								: dayAppts.length < 5
									? 'записи'
									: 'записей'}
						</p>

						{dayAppts.length === 0 ? (
							<p className='text-sm text-gray-400 text-center py-6'>
								Нет записей
							</p>
						) : (
							<div className='flex flex-col gap-3'>
								{dayAppts
									.sort((a, b) => a.time.localeCompare(b.time))
									.map(a => (
										<div
											key={a.id}
											className='border border-gray-100 rounded-xl p-3'
										>
											<div className='flex items-center justify-between mb-1'>
												<span className='font-bold text-pink-500 text-sm'>
													{a.time}
												</span>
												<span
													className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}
												>
													{STATUS_LABELS[a.status]}
												</span>
											</div>
											<p className='font-medium text-gray-800 text-sm'>
												{a.userName}
											</p>
											<p className='text-xs text-gray-500 mt-0.5'>
												{a.service}
											</p>
											{a.userPhone && (
												<p className='text-xs text-pink-500 mt-0.5'>
													📞 {a.userPhone}
												</p>
											)}
											{a.duration && (
												<p className='text-xs text-gray-400'>
													⏱ {a.duration} ч
												</p>
											)}
										</div>
									))}
							</div>
						)}
					</div>
				) : (
					<div className='bg-gray-50 rounded-2xl p-5 text-center text-gray-400 text-sm'>
						<div className='text-3xl mb-2'>📅</div>
						Нажмите на день
						<br />
						чтобы увидеть записи
					</div>
				)}
			</div>
		</div>
	)
}

// ─── Основной компонент AdminPanel ────────────────────────────────────────────

type Tab = 'appointments' | 'calendar' | 'stats'

export default function AdminPanel() {
	const { t } = useTranslation()
	const { token, user } = useAuth()
	const navigate = useNavigate()
	const [tab, setTab] = useState<Tab>('appointments')
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [stats, setStats] = useState<Stats | null>(null)
	const [filter, setFilter] = useState('all')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) {
			navigate('/home')
			return
		}
		if (user.role !== 'admin') {
			navigate('/home')
			return
		}
		loadData()
	}, [user])

	const loadData = async () => {
		setLoading(true)
		const [appts, st] = await Promise.all([
			apiFetch('/api/admin/appointments', {
				headers: { Authorization: `Bearer ${token}` },
			}).then(r => r.json()),
			apiFetch('/api/admin/stats', {
				headers: { Authorization: `Bearer ${token}` },
			}).then(r => r.json()),
		])
		setAppointments(appts)
		setStats(st)
		setLoading(false)
	}

	const updateStatus = async (id: string, status: string) => {
		await apiFetch(`/api/admin/appointments/${id}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ status }),
		})
		setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
		loadData()
	}

	const filtered =
		filter === 'all'
			? appointments
			: appointments.filter(a => a.status === filter)

	const TABS: { key: Tab; label: string; icon: string }[] = [
		{ key: 'appointments', label: 'Записи', icon: '📋' },
		{ key: 'calendar', label: 'Календарь', icon: '📅' },
		{ key: 'stats', label: 'Статистика', icon: '📊' },
	]

	return (
		<div className='py-10 px-4 max-w-6xl mx-auto'>
			<div className='flex items-center justify-between mb-6'>
				<h1
					className='text-3xl font-bold text-gray-800'
					style={{ fontFamily: 'Georgia, serif' }}
				>
					{t('admin.title')}
				</h1>
				<span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold'>
					Admin
				</span>
			</div>

			{/* Tabs */}
			<div className='flex gap-2 mb-6 border-b border-gray-200'>
				{TABS.map(tb => (
					<button
						key={tb.key}
						onClick={() => setTab(tb.key)}
						className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-1.5 ${
							tab === tb.key
								? 'border-pink-500 text-pink-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						}`}
					>
						<span>{tb.icon}</span>
						{tb.label}
					</button>
				))}
			</div>

			{loading ? (
				<div className='flex items-center justify-center py-20'>
					<div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
				</div>
			) : (
				<>
					{/* Календарь */}
					{tab === 'calendar' && <CalendarTab appointments={appointments} />}

					{/* Статистика */}
					{tab === 'stats' && stats && (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
							{[
								{
									label: 'Всего записей',
									value: stats.total,
									color: 'bg-gray-50',
								},
								{
									label: 'Ожидают',
									value: stats.pending,
									color: 'bg-yellow-50',
								},
								{
									label: 'Подтверждены',
									value: stats.confirmed,
									color: 'bg-green-50',
								},
								{
									label: 'Завершены',
									value: stats.completed,
									color: 'bg-blue-50',
								},
								{
									label: 'Отменены',
									value: stats.cancelled,
									color: 'bg-red-50',
								},
								{
									label: 'Клиентов',
									value: stats.totalClients,
									color: 'bg-purple-50',
								},
							].map(s => (
								<div
									key={s.label}
									className={`${s.color} rounded-2xl p-5 text-center`}
								>
									<p className='text-3xl font-bold text-gray-800 mb-1'>
										{s.value}
									</p>
									<p className='text-xs text-gray-500'>{s.label}</p>
								</div>
							))}
						</div>
					)}

					{/* Записи */}
					{tab === 'appointments' && (
						<>
							<div className='flex flex-wrap gap-2 mb-5'>
								{['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
									f => (
										<button
											key={f}
											onClick={() => setFilter(f)}
											className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
												filter === f
													? 'bg-pink-500 text-white'
													: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
											}`}
										>
											{f === 'all' ? 'Все' : STATUS_LABELS[f]}
											{f !== 'all' && stats && (
												<span className='ml-1 opacity-70'>
													({(stats as any)[f] ?? 0})
												</span>
											)}
										</button>
									),
								)}
							</div>

							{filtered.length === 0 ? (
								<div className='text-center py-12 text-gray-400'>
									Нет записей
								</div>
							) : (
								<div className='flex flex-col gap-3'>
									{filtered.map(a => (
										<div
											key={a.id}
											className='bg-white rounded-2xl border border-gray-100 p-4 sm:p-5'
										>
											<div className='flex flex-col sm:flex-row sm:items-center gap-3'>
												<div className='flex-1 min-w-0'>
													<div className='flex items-center gap-2 flex-wrap'>
														<p className='font-semibold text-gray-800'>
															{a.userName}
														</p>
														<span
															className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-500'}`}
														>
															{STATUS_LABELS[a.status] || a.status}
														</span>
													</div>
													<p className='text-sm text-gray-500 mt-0.5'>
														{a.userEmail}
													</p>
													{a.userPhone && (
														<p className='text-sm text-pink-600 font-medium'>
															📞 {a.userPhone}
														</p>
													)}
													<p className='text-sm text-gray-700 mt-1 font-medium'>
														{a.service}
													</p>
													<p className='text-sm text-gray-400'>
														📅 {a.date} · ⏰ {a.time}
														{a.duration ? ` · ⏱ ${a.duration} ч` : ''}
													</p>
													{a.comment && (
														<p className='text-xs text-gray-400 mt-1 italic'>
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
													{(a.status === 'pending' ||
														a.status === 'confirmed') && (
														<button
															onClick={() => updateStatus(a.id, 'completed')}
															className='px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors'
														>
															✓✓ Завершить
														</button>
													)}
													{a.status !== 'cancelled' &&
														a.status !== 'completed' && (
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
					)}
				</>
			)}
		</div>
	)
}
