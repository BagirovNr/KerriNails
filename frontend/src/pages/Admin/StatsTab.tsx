import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	LineChart,
	Line,
	AreaChart,
	Area,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { useAdminData } from '../../hooks/useAdminData'
import { apiFetch } from '../../utils/api'

interface MonthPoint {
	month: string
	label: string
	value: number
}

interface AnalyticsData {
	months: { key: string; label: string }[]
	bookingsByMonth: MonthPoint[]
	revenueByMonth: MonthPoint[]
	cancellationsByMonth: MonthPoint[]
	newClientsByMonth: MonthPoint[]
	utilizationByMonth: MonthPoint[]
	popularServices: { name: string; count: number; revenue: number }[]
	clients: { newInPeriod: number; returningInPeriod: number; repeatRate: number }
	totals: { totalRevenue: number; totalBookings: number; totalCancellations: number; avgCheck: number }
}

const PIE_COLORS = ['#ec4899', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#22d3ee', '#f472b6']

const TOOLTIP_STYLE = {
	background: '#111827',
	border: '1px solid #1f2937',
	borderRadius: 12,
	fontSize: 12,
	color: '#e5e7eb',
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
	return (
		<div className='chart-card bg-gray-900 border border-gray-800 rounded-2xl p-5'>
			<h3 className='text-sm font-semibold text-gray-100 mb-0.5'>{title}</h3>
			{subtitle && <p className='text-xs text-gray-500 mb-3'>{subtitle}</p>}
			{!subtitle && <div className='mb-3' />}
			<div className='h-64'>{children}</div>
		</div>
	)
}

export default function StatsTab() {
	const { token } = useAuth()
	const { stats, loading: apptLoading, error: apptError, reload: reloadAppt } = useAdminData()
	const [data, setData] = useState<AnalyticsData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [months, setMonths] = useState(6)
	const rootRef = useRef<HTMLDivElement>(null)
	const chartsRef = useRef<HTMLDivElement>(null)

	async function loadAnalytics() {
		if (!token) return
		setLoading(true)
		setError(null)
		try {
			const res = await apiFetch(`/api/admin/analytics?months=${months}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!res.ok) throw new Error(`Сервер вернул ошибку ${res.status}`)
			const json = await res.json()
			setData(json)
		} catch (e: any) {
			console.error('[StatsTab] не удалось загрузить аналитику:', e)
			setError(e?.message || 'Не удалось загрузить аналитику')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadAnalytics()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, months])

	useGSAP(
		() => {
			if (loading || !data) return
			gsap.from('.stat-card', { opacity: 0, y: 16, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
			gsap.from('.chart-card', { opacity: 0, y: 16, duration: 0.4, stagger: 0.08, delay: 0.2, ease: 'power2.out' })
		},
		{ scope: rootRef, dependencies: [loading, data] },
	)

	const cards = stats
		? [
				{ label: 'Всего записей', value: stats.total, icon: '📋', accent: 'text-pink-400 bg-pink-500/10' },
				{ label: 'Ожидают', value: stats.pending, icon: '⏳', accent: 'text-yellow-300 bg-yellow-500/10' },
				{ label: 'Подтверждены', value: stats.confirmed, icon: '✅', accent: 'text-green-300 bg-green-500/10' },
				{ label: 'Завершены', value: stats.completed, icon: '🏁', accent: 'text-blue-300 bg-blue-500/10' },
				{ label: 'Отменены', value: stats.cancelled, icon: '✕', accent: 'text-red-400 bg-red-500/10' },
				{ label: 'Клиентов', value: stats.totalClients, icon: '👥', accent: 'text-purple-300 bg-purple-500/10' },
			]
		: []

	if (apptError && !stats) {
		return (
			<div>
				<h2 className='text-lg font-semibold text-gray-100 mb-5'>Статистика</h2>
				<div className='bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center'>
					<p className='text-gray-400 text-sm mb-3'>Не удалось загрузить статистику: {apptError}</p>
					<button
						onClick={() => reloadAppt()}
						className='px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-xl font-medium transition-colors'
					>
						Попробовать снова
					</button>
				</div>
			</div>
		)
	}

	const pieData = data
		? [
				{ name: 'Новые', value: data.clients.newInPeriod },
				{ name: 'Постоянные', value: data.clients.returningInPeriod },
			]
		: []

	return (
		<div ref={rootRef}>
			<div className='flex items-center justify-between mb-5 flex-wrap gap-3'>
				<h2 className='text-lg font-semibold text-gray-100'>Статистика</h2>
				<select
					value={months}
					onChange={e => setMonths(Number(e.target.value))}
					className='border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400'
				>
					<option value={3}>3 месяца</option>
					<option value={6}>6 месяцев</option>
					<option value={12}>12 месяцев</option>
				</select>
			</div>

			{/* Карточки по записям (мгновенный снапшот, из useAdminData) */}
			{stats && (
				<>
					<div className='flex sm:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory mb-6'>
						{cards.map(s => (
							<div key={s.label} className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5 shrink-0 w-40 snap-start'>
								<div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 ${s.accent}`}>{s.icon}</div>
								<p className='text-3xl font-bold text-gray-100 mb-1'>{s.value}</p>
								<p className='text-xs text-gray-500'>{s.label}</p>
							</div>
						))}
					</div>
					<div className='hidden sm:grid grid-cols-3 md:grid-cols-6 gap-4 mb-6'>
						{cards.map(s => (
							<div key={s.label} className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors'>
								<div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 ${s.accent}`}>{s.icon}</div>
								<p className='text-3xl font-bold text-gray-100 mb-1'>{s.value}</p>
								<p className='text-xs text-gray-500'>{s.label}</p>
							</div>
						))}
					</div>
				</>
			)}

			{/* Финансовые/клиентские карточки из аналитики */}
			{data && (
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
					<div className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5'>
						<div className='w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 text-green-300 bg-green-500/10'>💰</div>
						<p className='text-2xl font-bold text-gray-100 mb-1'>{data.totals.totalRevenue.toLocaleString('ru-RU')} ₽</p>
						<p className='text-xs text-gray-500'>Выручка за период</p>
					</div>
					<div className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5'>
						<div className='w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 text-pink-400 bg-pink-500/10'>🧾</div>
						<p className='text-2xl font-bold text-gray-100 mb-1'>{data.totals.avgCheck.toLocaleString('ru-RU')} ₽</p>
						<p className='text-xs text-gray-500'>Средний чек</p>
					</div>
					<div className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5'>
						<div className='w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 text-blue-300 bg-blue-500/10'>🔁</div>
						<p className='text-2xl font-bold text-gray-100 mb-1'>{data.clients.repeatRate}%</p>
						<p className='text-xs text-gray-500'>Повторные записи</p>
					</div>
					<div className='stat-card bg-gray-900 border border-gray-800 rounded-2xl p-5'>
						<div className='w-9 h-9 rounded-xl flex items-center justify-center text-base mb-3 text-red-400 bg-red-500/10'>✕</div>
						<p className='text-2xl font-bold text-gray-100 mb-1'>{data.totals.totalCancellations}</p>
						<p className='text-xs text-gray-500'>Отмен за период</p>
					</div>
				</div>
			)}

			{loading && !data && (
				<div className='flex items-center justify-center py-16'>
					<div className='w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
				</div>
			)}

			{error && !loading && (
				<div className='bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center mb-6'>
					<p className='text-gray-400 text-sm mb-3'>Не удалось загрузить графики: {error}</p>
					<button
						onClick={loadAnalytics}
						className='px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-xl font-medium transition-colors'
					>
						Попробовать снова
					</button>
				</div>
			)}

			{data && (
				<div ref={chartsRef} className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
					<ChartCard title='Записи по месяцам' subtitle='Количество записей, назначенных на месяц'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={data.bookingsByMonth}>
								<CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
								<XAxis dataKey='label' stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} />
								<YAxis stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
								<Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff08' }} />
								<Bar dataKey='value' name='Записи' fill='#ec4899' radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title='Выручка' subtitle='По завершённым записям, ₽'>
						<ResponsiveContainer width='100%' height='100%'>
							<AreaChart data={data.revenueByMonth}>
								<defs>
									<linearGradient id='revenueFill' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='0%' stopColor='#ec4899' stopOpacity={0.35} />
										<stop offset='100%' stopColor='#ec4899' stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
								<XAxis dataKey='label' stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} />
								<YAxis stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} />
								<Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']} />
								<Area type='monotone' dataKey='value' name='Выручка' stroke='#ec4899' strokeWidth={2} fill='url(#revenueFill)' />
							</AreaChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title='Популярные услуги' subtitle='По количеству записей за период'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={data.popularServices} layout='vertical' margin={{ left: 8 }}>
								<CartesianGrid strokeDasharray='3 3' stroke='#1f2937' horizontal={false} />
								<XAxis type='number' stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
								<YAxis
									type='category'
									dataKey='name'
									stroke='#9ca3af'
									fontSize={11}
									tickLine={false}
									axisLine={false}
									width={110}
								/>
								<Tooltip contentStyle={TOOLTIP_STYLE} />
								<Bar dataKey='count' name='Записей' fill='#a78bfa' radius={[0, 6, 6, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title='Загрузка мастера' subtitle='% забронированных рабочих часов от доступных'>
						<ResponsiveContainer width='100%' height='100%'>
							<LineChart data={data.utilizationByMonth}>
								<CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
								<XAxis dataKey='label' stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} />
								<YAxis stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} unit='%' />
								<Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Загрузка']} />
								<Line type='monotone' dataKey='value' name='Загрузка' stroke='#60a5fa' strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} />
							</LineChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title='Новые клиенты' subtitle='По дате регистрации'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={data.newClientsByMonth}>
								<CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
								<XAxis dataKey='label' stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} />
								<YAxis stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
								<Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff08' }} />
								<Bar dataKey='value' name='Новые клиенты' fill='#34d399' radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title='Отмены' subtitle='Количество отменённых записей по месяцам'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={data.cancellationsByMonth}>
								<CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
								<XAxis dataKey='label' stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} />
								<YAxis stroke='#6b7280' fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
								<Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#ffffff08' }} />
								<Bar dataKey='value' name='Отмены' fill='#f87171' radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title='Новые vs постоянные клиенты' subtitle='Среди клиентов, обратившихся за период'>
						<ResponsiveContainer width='100%' height='100%'>
							<PieChart>
								<Pie data={pieData} dataKey='value' nameKey='name' innerRadius={55} outerRadius={80} paddingAngle={3}>
									{pieData.map((_, i) => (
										<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke='none' />
									))}
								</Pie>
								<Tooltip contentStyle={TOOLTIP_STYLE} />
								<Legend
									verticalAlign='bottom'
									height={24}
									formatter={(value: string) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
								/>
							</PieChart>
						</ResponsiveContainer>
					</ChartCard>
				</div>
			)}
		</div>
	)
}
