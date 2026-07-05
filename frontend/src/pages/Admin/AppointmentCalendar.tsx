import { useMemo, useState } from 'react'
import { DayPicker, type DayButtonProps } from 'react-day-picker'
import { ru } from 'react-day-picker/locale'
import { useAdminData } from '../../hooks/useAdminData'

const STATUS_LABELS: Record<string, string> = {
	pending: 'Ожидает',
	confirmed: 'Подтверждено',
	completed: 'Завершено',
	cancelled: 'Отменено',
}

const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-700',
	confirmed: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-600',
	completed: 'bg-blue-100 text-blue-700',
}

const DOT_COLORS: Record<string, string> = {
	pending: 'bg-yellow-400',
	confirmed: 'bg-green-400',
	completed: 'bg-blue-400',
	cancelled: 'bg-red-400',
}

function toKey(date: Date) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

/** Кастомная кнопка дня — число + до 3 точек-индикаторов записей под ним */
function DayButtonWithDots(byDate: Record<string, { status: string }[]>) {
	return function DayButton(props: DayButtonProps) {
		const { day, modifiers, ...rest } = props
		const key = toKey(day.date)
		const appts = byDate[key] || []

		return (
			<button
				{...rest}
				className={`relative w-full h-full min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-medium transition-all
          ${
						modifiers.selected
							? 'bg-pink-500 text-white shadow-md shadow-pink-200'
							: modifiers.today
								? 'bg-pink-50 border-2 border-pink-300 text-pink-700'
								: appts.length > 0
									? 'bg-gray-50 hover:bg-pink-50 text-gray-800'
									: 'text-gray-400 hover:bg-gray-50'
					}
          ${modifiers.outside ? 'opacity-30 pointer-events-none' : ''}
        `}
			>
				<span>{day.date.getDate()}</span>
				{appts.length > 0 && (
					<div className={`flex gap-0.5 ${modifiers.selected ? 'opacity-90' : ''}`}>
						{appts.slice(0, 3).map((a, i) => (
							<span key={i} className={`w-1 h-1 rounded-full ${modifiers.selected ? 'bg-white' : DOT_COLORS[a.status] || 'bg-gray-300'}`} />
						))}
						{appts.length > 3 && (
							<span className={`text-[8px] leading-none ${modifiers.selected ? 'text-white' : 'text-gray-400'}`}>+</span>
						)}
					</div>
				)}
			</button>
		)
	}
}

export default function AppointmentCalendar() {
	const { appointments } = useAdminData()
	const [selected, setSelected] = useState<Date | undefined>(undefined)
	const [month, setMonth] = useState<Date>(new Date())

	const byDate = useMemo(() => {
		const map: Record<string, typeof appointments> = {}
		appointments.forEach(a => {
			if (a.status === 'cancelled') return
			if (!map[a.date]) map[a.date] = []
			map[a.date].push(a)
		})
		return map
	}, [appointments])

	const DayButtonComponent = useMemo(() => DayButtonWithDots(byDate as any), [byDate])

	const selectedKey = selected ? toKey(selected) : null
	const dayAppts = selectedKey ? byDate[selectedKey] || [] : []

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			{/* Календарь */}
			<div className='flex-1 bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 shadow-sm overflow-x-auto'>
				<DayPicker
					mode='single'
					locale={ru}
					selected={selected}
					onSelect={d => setSelected(prev => (prev && d && toKey(prev) === toKey(d) ? undefined : d))}
					month={month}
					onMonthChange={setMonth}
					showOutsideDays
					components={{ DayButton: DayButtonComponent }}
					classNames={{
						root: 'min-w-[280px]',
						months: 'flex flex-col',
						month: 'w-full relative',
						month_caption: 'flex items-center justify-center py-2 mb-1 font-semibold text-gray-800 capitalize',
						nav: 'flex items-center justify-between absolute inset-x-0 top-0 px-1 pointer-events-none',
						button_previous:
							'pointer-events-auto w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors',
						button_next:
							'pointer-events-auto w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors',
						weekdays: 'grid grid-cols-7 mb-1',
						weekday: 'text-center text-xs font-medium py-1 text-gray-400 capitalize',
						week: 'grid grid-cols-7 gap-1',
						day: 'aspect-square p-0',
					}}
				/>

				{/* Легенда */}
				<div className='flex gap-4 mt-2 pt-4 border-t border-gray-100 flex-wrap'>
					{[
						['bg-yellow-400', 'Ожидает'],
						['bg-green-400', 'Подтверждено'],
						['bg-blue-400', 'Завершено'],
					].map(([c, l]) => (
						<div key={l} className='flex items-center gap-1.5 text-xs text-gray-500'>
							<div className={`w-2 h-2 rounded-full ${c}`} />
							{l}
						</div>
					))}
				</div>
			</div>

			{/* Панель записей выбранного дня */}
			<div className='lg:w-80'>
				{selected ? (
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm'>
						<h3 className='font-semibold text-gray-800 mb-1'>
							{selected.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
						</h3>
						<p className='text-xs text-gray-400 mb-4'>
							{dayAppts.length}{' '}
							{dayAppts.length === 1 ? 'запись' : dayAppts.length < 5 ? 'записи' : 'записей'}
						</p>

						{dayAppts.length === 0 ? (
							<p className='text-sm text-gray-400 text-center py-6'>Нет записей</p>
						) : (
							<div className='flex flex-col gap-3'>
								{dayAppts
									.slice()
									.sort((a, b) => a.time.localeCompare(b.time))
									.map(a => (
										<div key={a.id} className='border border-gray-100 rounded-xl p-3'>
											<div className='flex items-center justify-between mb-1'>
												<span className='font-bold text-pink-500 text-sm'>{a.time}</span>
												<span
													className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}
												>
													{STATUS_LABELS[a.status]}
												</span>
											</div>
											<p className='font-medium text-gray-800 text-sm'>{a.userName}</p>
											<p className='text-xs text-gray-500 mt-0.5'>{a.service}</p>
											{a.userPhone && (
												<p className='text-xs text-pink-500 mt-0.5'>📞 {a.userPhone}</p>
											)}
											{a.duration && <p className='text-xs text-gray-400'>⏱ {a.duration} ч</p>}
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
