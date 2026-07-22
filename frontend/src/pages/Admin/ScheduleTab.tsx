import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { apiFetch } from '../../utils/api'
import { useServices } from '../../hooks/useServices'
import { todayInSalonTZ } from '../../utils/time'

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface ScheduleBlock {
	id: string
	type: 'day_off' | 'vacation' | 'blocked_slot'
	date?: string
	dateFrom?: string
	dateTo?: string
	startTime?: string
	endTime?: string
	reason: string
}

interface Appointment {
	id: string
	userName: string
	userPhone: string
	service: string
	date: string
	time: string
	duration?: number
	status: string
	source?: string
}

interface ClientSearch {
	id: string
	name: string
	phone: string
	email: string
}

// ─── Утилиты времени ─────────────────────────────────────────────────────────

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
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAY_NAMES_FULL = [
	'Понедельник',
	'Вторник',
	'Среда',
	'Четверг',
	'Пятница',
	'Суббота',
	'Воскресенье',
]

function addDays(dateStr: string, n: number): string {
	const d = new Date(`${dateStr}T00:00:00Z`)
	d.setUTCDate(d.getUTCDate() + n)
	return d.toISOString().split('T')[0]
}

function getMondayOfWeek(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00Z`)
	const dow = (d.getUTCDay() + 6) % 7 // 0=пн
	d.setUTCDate(d.getUTCDate() - dow)
	return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
	const [y, m, d] = dateStr.split('-')
	return `${d}.${m}.${y}`
}

function getDayName(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00Z`)
	return DAY_NAMES_FULL[(d.getUTCDay() + 6) % 7]
}

function getDaysInMonth(y: number, m: number) {
	return new Date(y, m + 1, 0).getDate()
}
function getFirstDayOfMonth(y: number, m: number) {
	return (new Date(y, m, 1).getDay() + 6) % 7
}

const WORK_HOURS = Array.from(
	{ length: 10 },
	(_, i) => `${String(i + 10).padStart(2, '0')}:00`,
)

// ─── Вспомогательные UI-компоненты ───────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
	return (
		<span
			className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${color}`}
		>
			{label}
		</span>
	)
}

function blockLabel(b: ScheduleBlock) {
	if (b.type === 'day_off')
		return { text: 'Выходной', color: 'bg-red-500/15 text-red-300' }
	if (b.type === 'vacation')
		return { text: 'Отпуск', color: 'bg-orange-500/15 text-orange-300' }
	return {
		text: `${b.startTime}–${b.endTime}`,
		color: 'bg-gray-800 text-gray-200',
	}
}

function statusColor(s: string) {
	if (s === 'confirmed') return 'bg-green-500/15 text-green-300'
	if (s === 'pending') return 'bg-yellow-500/15 text-yellow-300'
	if (s === 'cancelled') return 'bg-red-500/15 text-red-400'
	return 'bg-gray-800 text-gray-300'
}

// ─── Модалка для одного дня (блоки + записи + добавление) ────────────────────

function DayModal({
	date,
	blocks,
	appointments,
	onClose,
	onBlockAdded,
	onBlockDeleted,
}: {
	date: string
	blocks: ScheduleBlock[]
	appointments: Appointment[]
	onClose: () => void
	onBlockAdded: (b: ScheduleBlock) => void
	onBlockDeleted: (id: string) => void
}) {
	const { token } = useAuth()
	const [addType, setAddType] = useState<'day_off' | 'blocked_slot' | ''>('')
	const [startTime, setStartTime] = useState('10:00')
	const [endTime, setEndTime] = useState('12:00')
	const [reason, setReason] = useState('')
	const [saving, setSaving] = useState(false)

	const save = async () => {
		if (!addType) return
		setSaving(true)
		try {
			const res = await apiFetch('/api/admin/schedule/admin/blocks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					type: addType,
					date,
					startTime: addType === 'blocked_slot' ? startTime : undefined,
					endTime: addType === 'blocked_slot' ? endTime : undefined,
					reason,
				}),
			})
			const b = await res.json()
			if (res.ok) {
				onBlockAdded(b)
				setAddType('')
				setReason('')
			}
		} finally {
			setSaving(false)
		}
	}

	const deleteBlock = async (id: string) => {
		await apiFetch(`/api/admin/schedule/admin/blocks/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		onBlockDeleted(id)
	}

	const dayAppts = appointments.filter(
		a => a.date === date && a.status !== 'cancelled',
	)
	const isDayOff = blocks.some(b => b.type === 'day_off')

	return (
		<div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/70 backdrop-blur-sm'
				onClick={onClose}
			/>
			<div className='relative w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden max-h-[90vh] flex flex-col'>
				<div className='h-1 bg-gradient-to-r from-pink-400 to-rose-400' />
				<div className='flex items-center justify-between px-6 py-4 border-b border-gray-800'>
					<div>
						<p className='font-bold text-gray-100'>{formatDate(date)}</p>
						<p className='text-xs text-gray-500'>{getDayName(date)}</p>
					</div>
					<button
						onClick={onClose}
						className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-500 text-xl'
					>
						×
					</button>
				</div>

				<div className='overflow-y-auto flex-1 p-6 space-y-5'>
					{/* Записи */}
					{dayAppts.length > 0 && (
						<div>
							<p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
								Записи
							</p>
							<div className='space-y-2'>
								{dayAppts.map(a => (
									<div
										key={a.id}
										className='flex items-center gap-3 bg-gray-800/60 rounded-xl px-3 py-2.5'
									>
										<div className='w-10 text-center'>
											<p className='text-sm font-bold text-gray-200'>
												{a.time}
											</p>
										</div>
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-medium text-gray-100 truncate'>
												{a.userName}
											</p>
											<p className='text-xs text-gray-500 truncate'>
												{a.service}
											</p>
										</div>
										<span
											className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor(a.status)}`}
										>
											{a.status === 'confirmed'
												? '✓'
												: a.status === 'pending'
													? '…'
													: a.status}
										</span>
										{a.source === 'manual' && (
											<span className='text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full'>
												ручная
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Блоки расписания */}
					{blocks.length > 0 && (
						<div>
							<p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
								Ограничения
							</p>
							<div className='space-y-2'>
								{blocks.map(b => {
									const { text, color } = blockLabel(b)
									return (
										<div
											key={b.id}
											className='flex items-center gap-3 bg-gray-800/60 rounded-xl px-3 py-2.5'
										>
											<Badge label={text} color={color} />
											<span className='flex-1 text-xs text-gray-400'>
												{b.reason || '—'}
											</span>
											<button
												onClick={() => deleteBlock(b.id)}
												className='text-red-400 hover:text-red-300 text-sm transition-colors'
												title='Удалить'
											>
												✕
											</button>
										</div>
									)
								})}
							</div>
						</div>
					)}

					{/* Форма добавления */}
					{!isDayOff && (
						<div className='border-t border-gray-800 pt-4'>
							<p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
								Добавить ограничение
							</p>
							<div className='flex gap-2 mb-3'>
								<button
									onClick={() =>
										setAddType(addType === 'day_off' ? '' : 'day_off')
									}
									className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${addType === 'day_off' ? 'border-red-500/60 bg-red-500/10 text-red-300' : 'border-gray-700 hover:border-red-500/40'}`}
								>
									🚫 Выходной
								</button>
								<button
									onClick={() =>
										setAddType(addType === 'blocked_slot' ? '' : 'blocked_slot')
									}
									className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${addType === 'blocked_slot' ? 'border-gray-600 bg-gray-800/60 text-gray-200' : 'border-gray-700 hover:border-gray-600'}`}
								>
									🔒 Блок слота
								</button>
							</div>

							{addType === 'blocked_slot' && (
								<div className='flex gap-2 mb-3'>
									<div className='flex-1'>
										<label className='text-xs text-gray-500 block mb-1'>
											С
										</label>
										<select
											value={startTime}
											onChange={e => setStartTime(e.target.value)}
											className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-pink-400'
										>
											{WORK_HOURS.map(h => (
												<option key={h}>{h}</option>
											))}
										</select>
									</div>
									<div className='flex-1'>
										<label className='text-xs text-gray-500 block mb-1'>
											До
										</label>
										<select
											value={endTime}
											onChange={e => setEndTime(e.target.value)}
											className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-pink-400'
										>
											{WORK_HOURS.filter(h => h > startTime).map(h => (
												<option key={h}>{h}</option>
											))}
										</select>
									</div>
								</div>
							)}

							{addType && (
								<>
									<input
										placeholder='Причина (необязательно)'
										value={reason}
										onChange={e => setReason(e.target.value)}
										className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 mb-2'
									/>
									<button
										onClick={save}
										disabled={saving}
										className='w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-500/20 text-white rounded-xl text-sm font-medium transition-all'
									>
										{saving ? 'Сохранение...' : 'Сохранить'}
									</button>
								</>
							)}
						</div>
					)}

					{isDayOff && (
						<p className='text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-center'>
							День помечен как выходной. Удалите его, чтобы добавить другие
							ограничения.
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

// ─── Модалка отпуска ──────────────────────────────────────────────────────────

function VacationModal({
	onClose,
	onSaved,
}: {
	onClose: () => void
	onSaved: (b: ScheduleBlock) => void
}) {
	const { token } = useAuth()
	const today = todayInSalonTZ()
	const [dateFrom, setDateFrom] = useState(today)
	const [dateTo, setDateTo] = useState(addDays(today, 7))
	const [reason, setReason] = useState('')
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const save = async () => {
		if (dateTo < dateFrom) {
			setError('Дата окончания раньше начала')
			return
		}
		setSaving(true)
		setError('')
		try {
			const res = await apiFetch('/api/admin/schedule/admin/blocks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ type: 'vacation', dateFrom, dateTo, reason }),
			})
			const b = await res.json()
			if (!res.ok) {
				setError(b.error || 'Ошибка')
				return
			}
			onSaved(b)
			onClose()
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/70 backdrop-blur-sm'
				onClick={onClose}
			/>
			<div className='relative w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl shadow-black/40 p-6'>
				<h3 className='font-bold text-gray-100 mb-4 text-lg'>
					🌴 Добавить отпуск
				</h3>
				<div className='space-y-3'>
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Начало</label>
						<input
							type='date'
							value={dateFrom}
							min={today}
							onChange={e => setDateFrom(e.target.value)}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
						/>
					</div>
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Конец</label>
						<input
							type='date'
							value={dateTo}
							min={dateFrom}
							onChange={e => setDateTo(e.target.value)}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
						/>
					</div>
					<div>
						<label className='text-xs text-gray-400 block mb-1'>
							Причина (необязательно)
						</label>
						<input
							value={reason}
							onChange={e => setReason(e.target.value)}
							placeholder='Отпуск'
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
						/>
					</div>
				</div>
				{error && <p className='text-red-400 text-xs mt-2'>{error}</p>}
				<div className='flex gap-2 mt-5'>
					<button
						onClick={onClose}
						className='flex-1 py-2.5 border border-gray-700 rounded-xl text-sm hover:bg-gray-800/60'
					>
						Отмена
					</button>
					<button
						onClick={save}
						disabled={saving}
						className='flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/20 text-white rounded-xl text-sm font-medium'
					>
						{saving ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</div>
		</div>
	)
}

// ─── Модалка ручной записи ────────────────────────────────────────────────────

function ManualBookingModal({
	onClose,
	onSaved,
	preselectedDate,
}: {
	onClose: () => void
	onSaved: (a: Appointment) => void
	preselectedDate?: string
}) {
	const { token } = useAuth()
	const { services } = useServices()
	const today = todayInSalonTZ()

	const [clientMode, setClientMode] = useState<'search' | 'new'>('search')
	const [query, setQuery] = useState('')
	const [searchResults, setSearchResults] = useState<ClientSearch[]>([])
	const [selectedClient, setSelectedClient] = useState<ClientSearch | null>(
		null,
	)
	const [guestName, setGuestName] = useState('')
	const [guestPhone, setGuestPhone] = useState('')
	const [guestEmail, setGuestEmail] = useState('')
	const [service, setService] = useState(services[0]?.name || '')
	const [date, setDate] = useState(preselectedDate || today)
	const [time, setTime] = useState('10:00')
	const [slots, setSlots] = useState<string[]>([])
	const [comment, setComment] = useState('')

	// Если модалка открылась раньше, чем прогрузился список услуг — подставляем первую, как только он появится
	useEffect(() => {
		if (!service && services.length > 0) setService(services[0].name)
	}, [services, service])
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	// Поиск клиентов с дебаунсом
	useEffect(() => {
		if (query.length < 2) {
			setSearchResults([])
			return
		}
		const t = setTimeout(async () => {
			const res = await apiFetch(
				`/api/admin/schedule/admin/clients-search?q=${encodeURIComponent(query)}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			)
			setSearchResults(await res.json())
		}, 300)
		return () => clearTimeout(t)
	}, [query])

	// Загружаем слоты при смене даты
	useEffect(() => {
		if (!date) return
		apiFetch(`/api/appointments/slots?date=${date}&duration=1`)
			.then(r => r.json())
			.then(d => setSlots(d.available || []))
	}, [date])

	const submit = async () => {
		setSaving(true)
		setError('')
		try {
			const body: Record<string, any> = { service, date, time, comment }
			if (selectedClient) {
				body.userId = selectedClient.id
			} else {
				if (!guestName || !guestPhone) {
					setError('Укажите имя и телефон')
					setSaving(false)
					return
				}
				body.guestName = guestName
				body.guestPhone = guestPhone
				body.guestEmail = guestEmail
			}
			const res = await apiFetch('/api/admin/schedule/admin/manual-booking', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			})
			const data = await res.json()
			if (!res.ok) {
				setError(data.error || 'Ошибка')
				return
			}
			onSaved(data)
			onClose()
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/70 backdrop-blur-sm'
				onClick={onClose}
			/>
			<div className='relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden max-h-[90vh] flex flex-col'>
				<div className='h-1 bg-gradient-to-r from-purple-400 to-pink-400' />
				<div className='flex items-center justify-between px-6 py-4 border-b border-gray-800'>
					<h3 className='font-bold text-gray-100'>
						✍️ Записать клиента вручную
					</h3>
					<button
						onClick={onClose}
						className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-500 text-xl'
					>
						×
					</button>
				</div>
				<div className='overflow-y-auto flex-1 p-6 space-y-4'>
					{/* Выбор режима клиента */}
					<div className='flex gap-2'>
						<button
							onClick={() => {
								setClientMode('search')
								setSelectedClient(null)
							}}
							className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${clientMode === 'search' ? 'border-pink-400 bg-pink-500/10 text-pink-300' : 'border-gray-700 hover:border-gray-600'}`}
						>
							🔍 Найти клиента
						</button>
						<button
							onClick={() => {
								setClientMode('new')
								setSelectedClient(null)
								setQuery('')
							}}
							className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${clientMode === 'new' ? 'border-pink-400 bg-pink-500/10 text-pink-300' : 'border-gray-700 hover:border-gray-600'}`}
						>
							➕ Новый клиент
						</button>
					</div>

					{clientMode === 'search' && (
						<div>
							{selectedClient ? (
								<div className='flex items-center gap-3 bg-pink-500/10 border border-pink-500/30 rounded-xl px-3 py-2.5'>
									<div className='flex-1'>
										<p className='text-sm font-semibold text-gray-100'>
											{selectedClient.name}
										</p>
										<p className='text-xs text-gray-500'>
											{selectedClient.phone}
										</p>
									</div>
									<button
										onClick={() => setSelectedClient(null)}
										className='text-gray-500 hover:text-gray-300 text-sm'
									>
										✕
									</button>
								</div>
							) : (
								<div className='relative'>
									<input
										value={query}
										onChange={e => setQuery(e.target.value)}
										placeholder='Имя, телефон или email...'
										className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400'
									/>
									{searchResults.length > 0 && (
										<div className='absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto'>
											{searchResults.map(c => (
												<button
													key={c.id}
													onClick={() => {
														setSelectedClient(c)
														setQuery('')
														setSearchResults([])
													}}
													className='w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/60 text-left transition-colors'
												>
													<div>
														<p className='text-sm font-medium text-gray-100'>
															{c.name}
														</p>
														<p className='text-xs text-gray-500'>{c.phone}</p>
													</div>
												</button>
											))}
										</div>
									)}
									{query.length >= 2 && searchResults.length === 0 && (
										<p className='text-xs text-gray-500 mt-1 px-1'>
											Не найдено — создайте нового клиента
										</p>
									)}
								</div>
							)}
						</div>
					)}

					{clientMode === 'new' && (
						<div className='space-y-2'>
							<input
								value={guestName}
								onChange={e => setGuestName(e.target.value)}
								placeholder='Имя *'
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							/>
							<input
								value={guestPhone}
								onChange={e => setGuestPhone(e.target.value)}
								placeholder='Телефон * (+7...)'
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							/>
							<input
								value={guestEmail}
								onChange={e => setGuestEmail(e.target.value)}
								placeholder='Email (необязательно)'
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							/>
						</div>
					)}

					{/* Услуга */}
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Услуга</label>
						<select
							value={service}
							onChange={e => setService(e.target.value)}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
						>
							{services.map(s => (
								<option key={s.name} value={s.name}>
									{s.name}
								</option>
							))}
						</select>
					</div>

					{/* Дата */}
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Дата</label>
						<input
							type='date'
							value={date}
							min={today}
							onChange={e => setDate(e.target.value)}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
						/>
					</div>

					{/* Время */}
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Время</label>
						<div className='grid grid-cols-5 gap-1.5'>
							{WORK_HOURS.map(h => (
								<button
									key={h}
									onClick={() => setTime(h)}
									className={`py-1.5 rounded-lg text-xs border transition-all ${time === h ? 'border-pink-400 bg-pink-500/10 text-pink-300 font-semibold' : slots.includes(h) ? 'border-gray-700 hover:border-pink-500/40' : 'border-gray-800 bg-gray-800/60 text-gray-600 cursor-not-allowed'}`}
									disabled={!slots.includes(h)}
								>
									{h}
								</button>
							))}
						</div>
					</div>

					{/* Комментарий */}
					<div>
						<label className='text-xs text-gray-400 block mb-1'>
							Комментарий
						</label>
						<textarea
							value={comment}
							onChange={e => setComment(e.target.value)}
							rows={2}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-pink-400'
						/>
					</div>

					{error && <p className='text-red-400 text-sm'>{error}</p>}
				</div>
				<div className='px-6 pb-6 pt-2'>
					<button
						onClick={submit}
						disabled={saving || (!selectedClient && clientMode === 'search')}
						className='w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-500/20 text-white rounded-xl text-sm font-semibold transition-all'
					>
						{saving ? 'Сохранение...' : 'Записать'}
					</button>
				</div>
			</div>
		</div>
	)
}

// ─── Основной компонент вкладки ───────────────────────────────────────────────

export default function ScheduleTab({
	appointments: initialAppointments,
}: {
	appointments: Appointment[]
}) {
	const { token } = useAuth()
	const today = todayInSalonTZ()

	const [view, setView] = useState<'week' | 'month'>('week')
	const [weekStart, setWeekStart] = useState(getMondayOfWeek(today))
	const [calYear, setCalYear] = useState(new Date().getFullYear())
	const [calMonth, setCalMonth] = useState(new Date().getMonth())
	const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
	const [appointments, setAppointments] =
		useState<Appointment[]>(initialAppointments)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [showVacation, setShowVacation] = useState(false)
	const [showManualBooking, setShowManualBooking] = useState(false)
	const [manualDate, setManualDate] = useState<string | undefined>(undefined)

	// Диапазон дат, видимый в текущем виде
	const rangeFrom =
		view === 'week'
			? weekStart
			: `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`
	const rangeTo =
		view === 'week'
			? addDays(weekStart, 6)
			: `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${getDaysInMonth(calYear, calMonth)}`

	const loadBlocks = useCallback(async () => {
		const res = await apiFetch(
			`/api/admin/schedule/admin/blocks?from=${rangeFrom}&to=${rangeTo}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		)
		setBlocks(await res.json())
	}, [rangeFrom, rangeTo, token])

	useEffect(() => {
		loadBlocks()
	}, [loadBlocks])

	const blocksForDate = (date: string) =>
		blocks.filter(b => {
			if (b.type === 'day_off' || b.type === 'blocked_slot')
				return b.date === date
			if (b.type === 'vacation') return b.dateFrom! <= date && date <= b.dateTo!
			return false
		})

	const apptForDate = (date: string) =>
		appointments.filter(a => a.date === date && a.status !== 'cancelled')

	const isDayOff = (date: string) =>
		blocksForDate(date).some(b => b.type === 'day_off' || b.type === 'vacation')

	// Недельный вид
	const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

	// Месячный вид
	const firstDow = getFirstDayOfMonth(calYear, calMonth)
	const daysInMonth = getDaysInMonth(calYear, calMonth)
	const calDays: Array<string | null> = [
		...Array(firstDow).fill(null),
		...Array.from(
			{ length: daysInMonth },
			(_, i) =>
				`${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
		),
	]

	const handleDayClick = (date: string) => setSelectedDate(date)

	const handleManualBookingFromDay = (date: string) => {
		setManualDate(date)
		setSelectedDate(null)
		setShowManualBooking(true)
	}

	const DayCell = ({
		date,
		isMonthView = false,
	}: {
		date: string
		isMonthView?: boolean
	}) => {
		const dayBlocks = blocksForDate(date)
		const dayAppts = apptForDate(date)
		const dayOff = isDayOff(date)
		const isToday = date === today
		const isPast = date < today

		return (
			<button
				onClick={() => handleDayClick(date)}
				className={`relative text-left rounded-xl border transition-all hover:shadow-md active:scale-[0.98] ${
					isMonthView ? 'p-2 min-h-[80px]' : 'p-3 min-h-[120px]'
				} ${
					dayOff
						? 'bg-red-500/10 border-red-500/30'
						: isPast
							? 'bg-gray-800/60 border-gray-800 opacity-60'
							: isToday
								? 'bg-pink-500/10 border-pink-500/60 ring-2 ring-pink-500/30'
								: 'bg-gray-900 border-gray-800 hover:border-pink-500/40'
				}`}
			>
				<div className='flex items-center justify-between mb-1'>
					<span
						className={`text-sm font-bold ${isToday ? 'text-pink-400' : dayOff ? 'text-red-400' : 'text-gray-200'}`}
					>
						{isMonthView
							? new Date(`${date}T00:00:00Z`).getUTCDate()
							: `${DAY_NAMES_SHORT[(new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7]}, ${formatDate(date).slice(0, 5)}`}
					</span>
					{dayOff && (
						<span className='text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-medium'>
							выходной
						</span>
					)}
				</div>
				{!dayOff && (
					<div className='space-y-1'>
						{dayAppts.slice(0, isMonthView ? 2 : 4).map(a => (
							<div
								key={a.id}
								className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium truncate ${statusColor(a.status)}`}
							>
								{a.time} {a.userName}
							</div>
						))}
						{dayAppts.length > (isMonthView ? 2 : 4) && (
							<p className='text-[10px] text-gray-500'>
								+{dayAppts.length - (isMonthView ? 2 : 4)} ещё
							</p>
						)}
						{dayBlocks
							.filter(b => b.type === 'blocked_slot')
							.slice(0, 2)
							.map(b => (
								<div
									key={b.id}
									className='text-[11px] px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400 truncate'
								>
									🔒 {b.startTime}–{b.endTime}
								</div>
							))}
					</div>
				)}
			</button>
		)
	}

	return (
		<div>
			<h2 className='text-lg font-semibold text-gray-100 mb-5'>Расписание</h2>
			{/* Панель управления */}
			<div className='flex flex-wrap items-center gap-2 mb-4'>
				{/* Переключатель вид */}
				<div className='flex bg-gray-800 rounded-xl p-1'>
					{(['week', 'month'] as const).map(v => (
						<button
							key={v}
							onClick={() => setView(v)}
							className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-gray-900 shadow text-gray-100' : 'text-gray-400 hover:text-gray-200'}`}
						>
							{v === 'week' ? '📅 Неделя' : '🗓 Месяц'}
						</button>
					))}
				</div>

				{/* Навигация */}
				{view === 'week' && (
					<div className='flex items-center gap-2'>
						<button
							onClick={() => setWeekStart(addDays(weekStart, -7))}
							className='w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 hover:bg-gray-800/60 text-gray-300'
						>
							‹
						</button>
						<span className='text-sm text-gray-300 min-w-[140px] text-center'>
							{formatDate(weekStart).slice(0, 5)} –{' '}
							{formatDate(addDays(weekStart, 6)).slice(0, 5)}
						</span>
						<button
							onClick={() => setWeekStart(addDays(weekStart, 7))}
							className='w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 hover:bg-gray-800/60 text-gray-300'
						>
							›
						</button>
						<button
							onClick={() => setWeekStart(getMondayOfWeek(today))}
							className='text-xs text-pink-400 hover:text-pink-300 ml-1'
						>
							Сегодня
						</button>
					</div>
				)}
				{view === 'month' && (
					<div className='flex items-center gap-2'>
						<button
							onClick={() => {
								if (calMonth === 0) {
									setCalMonth(11)
									setCalYear(y => y - 1)
								} else setCalMonth(m => m - 1)
							}}
							className='w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 hover:bg-gray-800/60 text-gray-300'
						>
							‹
						</button>
						<span className='text-sm text-gray-200 min-w-[120px] text-center font-medium'>
							{MONTH_NAMES[calMonth]} {calYear}
						</span>
						<button
							onClick={() => {
								if (calMonth === 11) {
									setCalMonth(0)
									setCalYear(y => y + 1)
								} else setCalMonth(m => m + 1)
							}}
							className='w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 hover:bg-gray-800/60 text-gray-300'
						>
							›
						</button>
					</div>
				)}

				<div className='ml-auto flex gap-2'>
					<button
						onClick={() => setShowVacation(true)}
						className='flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-medium rounded-xl transition-colors'
					>
						🌴 Отпуск
					</button>
					<button
						onClick={() => {
							setManualDate(undefined)
							setShowManualBooking(true)
						}}
						className='flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-medium rounded-xl transition-colors'
					>
						✍️ Записать клиента
					</button>
				</div>
			</div>

			{/* Недельный вид */}
			{view === 'week' && (
				<div className='overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0'>
					<div className='grid grid-cols-7 gap-2 min-w-[700px] sm:min-w-0'>
						{weekDays.map(date => (
							<DayCell key={date} date={date} />
						))}
					</div>
				</div>
			)}

			{/* Месячный вид */}
			{view === 'month' && (
<<<<<<< HEAD
				<div className='overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0'>
					<div className='min-w-[640px] sm:min-w-0'>
						<div className='grid grid-cols-7 gap-1 mb-1'>
							{DAY_NAMES_SHORT.map(d => (
								<div
									key={d}
									className='text-center text-xs font-semibold text-gray-500 py-1'
								>
									{d}
								</div>
							))}
						</div>
						<div className='grid grid-cols-7 gap-1'>
							{calDays.map((date, i) =>
								date ? (
									<DayCell key={date} date={date} isMonthView />
								) : (
									<div key={i} />
								),
							)}
						</div>
=======
				<div>
					<div className='grid grid-cols-7 gap-1 mb-1'>
						{DAY_NAMES_SHORT.map(d => (
							<div
								key={d}
								className='text-center text-xs font-semibold text-gray-500 py-1'
							>
								{d}
							</div>
						))}
					</div>
					<div className='grid grid-cols-7 gap-1'>
						{calDays.map((date, i) =>
							date ? (
								<DayCell key={date} date={date} isMonthView />
							) : (
								<div key={i} />
							),
						)}
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
					</div>
				</div>
			)}

			{/* Легенда */}
			<div className='flex flex-wrap gap-3 mt-4 text-xs text-gray-400'>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded bg-pink-500/15 border border-pink-500/60 inline-block' />
					Сегодня
				</span>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded bg-red-500/15 border border-red-500/30 inline-block' />
					Выходной / Отпуск
				</span>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded bg-green-500/15 inline-block' />
					Подтверждено
				</span>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded bg-yellow-500/15 inline-block' />
					Ожидает
				</span>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded bg-gray-800 inline-block' />
					Заблокировано
				</span>
			</div>

			{/* Модалки */}
			{selectedDate && (
				<DayModal
					date={selectedDate}
					blocks={blocksForDate(selectedDate)}
					appointments={apptForDate(selectedDate)}
					onClose={() => setSelectedDate(null)}
					onBlockAdded={b => {
						setBlocks(prev => [...prev, b])
						setSelectedDate(null)
					}}
					onBlockDeleted={id =>
						setBlocks(prev => prev.filter(b => b.id !== id))
					}
				/>
			)}

			{showVacation && (
				<VacationModal
					onClose={() => setShowVacation(false)}
					onSaved={b => {
						setBlocks(prev => [...prev, b])
						loadBlocks()
					}}
				/>
			)}

			{showManualBooking && (
				<ManualBookingModal
					onClose={() => setShowManualBooking(false)}
					preselectedDate={manualDate}
					onSaved={a => setAppointments(prev => [...prev, a as any])}
				/>
			)}
		</div>
	)
}
