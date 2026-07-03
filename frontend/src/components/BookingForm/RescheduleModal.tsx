import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { apiFetch } from '../../utils/api'

interface AppointmentLite {
	id: string
	service: string
	date: string
	time: string
	duration?: number
}

interface Props {
	appointment: AppointmentLite
	onClose: () => void
	onRescheduled: (updated: any) => void
}

const today = () => new Date().toISOString().split('T')[0]

// Возвращает true если слот уже прошёл (сегодня и час <= текущего)
function isSlotPast(date: string, slot: string): boolean {
	if (date !== today()) return false
	const now = new Date()
	const slotHour = parseInt(slot.split(':')[0], 10)
	return slotHour <= now.getHours()
}

export default function RescheduleModal({
	appointment,
	onClose,
	onRescheduled,
}: Props) {
	const { token } = useAuth()
	const [date, setDate] = useState(appointment.date)
	const [time, setTime] = useState('')
	const [slots, setSlots] = useState<string[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)

	const duration = appointment.duration || 1

	useEffect(() => {
		setSlotsLoading(true)
		apiFetch(
			`/api/appointments/slots?date=${date}&duration=${duration}&excludeId=${appointment.id}`,
		)
			.then(r => r.json())
			.then(d => setSlots(d.available || []))
			.finally(() => setSlotsLoading(false))
	}, [date])

	const submit = async () => {
		if (!time) return
		setLoading(true)
		setError('')
		try {
			const res = await apiFetch(
				`/api/appointments/${appointment.id}/reschedule`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ date, time }),
				},
			)
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Не удалось перенести запись')
			setSuccess(true)
			setTimeout(() => {
				onRescheduled(data)
				onClose()
			}, 1600)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 animate-fadeIn'>
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={onClose}
			/>

			<div className='relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fadeInScale'>
				<div className='h-1 bg-gradient-to-r from-pink-400 to-rose-400' />

				{success ? (
					<div className='p-10 text-center'>
						<div className='text-5xl mb-4'>🔁</div>
						<h3 className='text-xl font-bold text-gray-800 mb-2'>
							Запись перенесена
						</h3>
						<p className='text-gray-400 text-sm mt-1'>
							{date} · {time}
						</p>
						<p className='text-gray-400 text-xs mt-2'>
							Мастер подтвердит новое время
						</p>
					</div>
				) : (
					<div className='p-6 sm:p-8'>
						<h2 className='text-xl font-bold text-gray-800 mb-1'>
							Перенести запись
						</h2>
						<p className='text-sm text-gray-400 mb-5'>{appointment.service}</p>

						<div className='space-y-4'>
							<div>
								<label className='text-sm text-gray-500 block mb-1.5'>
									Новая дата
								</label>
								<input
									type='date'
									value={date}
									min={today()}
									onChange={e => {
										setDate(e.target.value)
										setTime('')
									}}
									className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100'
								/>
							</div>
							<div>
								<label className='text-sm text-gray-500 block mb-1.5'>
									Новое время
								</label>
								{slotsLoading ? (
									<div className='flex justify-center py-4'>
										<div className='w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin' />
									</div>
								) : (
									<div className='grid grid-cols-4 gap-2'>
										{slots
											.filter(s => !isSlotPast(date, s))
											.map(s => (
												<button
													key={s}
													onClick={() => setTime(s)}
													className={`py-2 rounded-lg text-sm border transition-all ${
														time === s
															? 'border-pink-400 bg-pink-50 text-pink-700 font-semibold'
															: 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
													}`}
												>
													{s}
												</button>
											))}
										{slots.filter(s => !isSlotPast(date, s)).length === 0 && (
											<p className='col-span-4 text-sm text-gray-400 text-center py-4'>
												Нет свободных слотов — выберите другой день
											</p>
										)}
									</div>
								)}
							</div>
						</div>

						{error && (
							<p className='mt-4 text-sm text-red-500 text-center'>{error}</p>
						)}

						<div className='flex gap-2 mt-6'>
							<button
								onClick={onClose}
								className='flex-1 py-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors'
							>
								Отмена
							</button>
							<button
								onClick={submit}
								disabled={!time || loading}
								className='flex-1 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]'
							>
								{loading ? (
									<span className='flex items-center justify-center gap-2'>
										<span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
										Сохранение...
									</span>
								) : (
									'Перенести'
								)}
							</button>
						</div>
					</div>
				)}

				<button
					onClick={onClose}
					className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-lg transition-colors'
				>
					×
				</button>
			</div>
		</div>
	)
}
