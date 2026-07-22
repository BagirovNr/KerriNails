import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useServices } from '../../hooks/useServices'
import { apiFetch } from '../../utils/api'
import { todayInSalonTZ, isSlotPast } from '../../utils/time'

interface Props {
	onClose: () => void
}

const today = todayInSalonTZ

function addDaysStr(dateStr: string, n: number): string {
	const d = new Date(`${dateStr}T00:00:00Z`)
	d.setUTCDate(d.getUTCDate() + n)
	return d.toISOString().split('T')[0]
}

function formatDateRu(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00Z`)
	const days = [
		'воскресенье',
		'понедельник',
		'вторник',
		'среда',
		'четверг',
		'пятница',
		'суббота',
	]
	const months = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря',
	]
	return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]}`
}

export default function BookingModal({ onClose }: Props) {
	const { t } = useTranslation()
	const { token, user } = useAuth()
	const { services } = useServices()
	const [step, setStep] = useState(1)
	const [selectedServices, setSelectedServices] = useState<string[]>([])
	const [date, setDate] = useState(today())
	const [time, setTime] = useState('')
	const [phone, setPhone] = useState(user?.phone || '')
	const [comment, setComment] = useState('')
	const [slots, setSlots] = useState<string[]>([])
	const [loading, setLoading] = useState(false)
	const [slotsLoading, setSlotsLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')

	const [dayBlocked, setDayBlocked] = useState(false)
	const [nextSlot, setNextSlot] = useState<{
		date: string
		time: string
	} | null>(null)
	const [loadingNextSlot, setLoadingNextSlot] = useState(false)

	const duration = Math.max(1, Math.min(selectedServices.length, 3))

	const toggleService = (name: string) => {
		setSelectedServices(prev =>
			prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name],
		)
	}

	const totalPrice = services.filter(s =>
		selectedServices.includes(s.name),
	).reduce((sum, s) => sum + s.price, 0)

	useEffect(() => {
		if (step !== 2 || !date) return
		setSlotsLoading(true)
		setDayBlocked(false)
		setNextSlot(null)
		setTime('')

		Promise.all([
			apiFetch(`/api/schedule/blocks?from=${date}&to=${date}`).then(r =>
				r.json(),
			),
			apiFetch(
				`/api/appointments/slots?date=${date}&duration=${duration}`,
			).then(r => r.json()),
		])
			.then(async ([blockData, slotData]) => {
				const blocked: boolean = blockData.blockedDays?.includes(date) ?? false
				setDayBlocked(blocked)
				if (blocked) {
					setLoadingNextSlot(true)
					try {
						const res = await apiFetch(
							`/api/schedule/next-slot?from=${addDaysStr(date, 1)}&duration=${duration}`,
						)
						const ns = await res.json()
						setNextSlot(ns.date ? ns : null)
					} finally {
						setLoadingNextSlot(false)
					}
					setSlots([])
				} else {
					setSlots(slotData.available || [])
				}
			})
			.finally(() => setSlotsLoading(false))
	}, [step, date, duration])

	const book = async () => {
		if (!phone.trim()) {
			setError('Укажите номер телефона')
			return
		}
		setLoading(true)
		setError('')
		try {
			const res = await apiFetch('/api/appointments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					services: selectedServices,
					date,
					time,
					comment,
					phone,
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error)
			setSuccess(true)
			setTimeout(onClose, 2800)
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
						<div className='text-5xl mb-4'>🌸</div>
						<h3 className='text-xl font-bold text-gray-800 mb-2'>
							{t('booking.success')}
						</h3>
						<p className='text-gray-400 text-sm mt-1'>
							{selectedServices.join(', ')}
						</p>
						<p className='text-gray-400 text-sm'>
							{date} · {time}
						</p>
					</div>
				) : (
					<div className='p-6 sm:p-8'>
						<h2 className='text-2xl font-bold text-gray-800 mb-1'>
							{t('booking.title')}
						</h2>

						{/* Step indicator */}
						<div className='flex gap-2 mb-6 mt-4'>
							{[1, 2, 3].map(s => (
								<div
									key={s}
									className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-pink-500' : 'bg-gray-200'}`}
								/>
							))}
						</div>

						{/* STEP 1 — Service */}
						{step === 1 && (
							<div>
								<p className='text-sm text-gray-500 mb-1'>
									{t('booking.select_service')}
								</p>
								<p className='text-xs text-gray-400 mb-3'>
									Можно выбрать несколько услуг сразу (например, маникюр +
									педикюр)
								</p>
								<div className='flex flex-col gap-2 max-h-64 overflow-y-auto pr-1'>
									{services.map(s => {
										const checked = selectedServices.includes(s.name)
										return (
											<button
												key={s.id}
												onClick={() => toggleService(s.name)}
												className={`text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${checked ? 'border-pink-400 bg-pink-50 text-pink-700 font-medium' : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'}`}
											>
												<span
													className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-300'}`}
												>
													{checked && '✓'}
												</span>
												<span className='flex-1'>
													<span className='font-medium'>{s.name}</span>
													<span className='ml-2 text-gray-400'>
														{s.price} ₽
													</span>
												</span>
											</button>
										)
									})}
								</div>
								{selectedServices.length > 0 && (
									<p className='mt-3 text-xs text-gray-500'>
										Выбрано: {selectedServices.length}{' '}
										{selectedServices.length === 1 ? 'услуга' : 'услуги'} ·
										Длительность: ~{duration} ч · Итого: {totalPrice} ₽
									</p>
								)}
								<button
									disabled={!selectedServices.length}
									onClick={() => setStep(2)}
									className='mt-4 w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-200 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all'
								>
									Далее →
								</button>
							</div>
						)}

						{/* STEP 2 — Date / Time */}
						{step === 2 && (
							<div className='space-y-4'>
								<div>
									<label className='text-sm text-gray-500 block mb-1.5'>
										{t('booking.select_date')}
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

								{/* Spinner / blocked / time slots */}
								{slotsLoading ? (
									<div className='flex justify-center py-4'>
										<div className='w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin' />
									</div>
								) : dayBlocked ? (
									<div className='bg-amber-50 border border-amber-200 rounded-xl p-4'>
										<p className='text-sm font-semibold text-amber-800 mb-1'>
											😔 К сожалению, в этот день мастер не принимает
										</p>
										{loadingNextSlot ? (
											<div className='flex items-center gap-2 mt-3'>
												<div className='w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin' />
												<span className='text-xs text-amber-600'>
													Ищем ближайшее свободное время...
												</span>
											</div>
										) : nextSlot ? (
											<>
												<p className='text-sm text-amber-700 mb-3'>
													Ближайшее свободное время —{' '}
													<span className='font-semibold'>
														{formatDateRu(nextSlot.date)} в {nextSlot.time}
													</span>
												</p>
												<div className='flex gap-2'>
													<button
														onClick={() => {
															setDate(nextSlot.date)
															setTime(nextSlot.time)
															setDayBlocked(false)
														}}
														className='flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98]'
													>
														✓ Записаться в это время
													</button>
													<button
														onClick={() => setDayBlocked(false)}
														className='flex-1 py-2.5 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-xl text-sm transition-all'
													>
														Выбрать другую дату
													</button>
												</div>
											</>
										) : (
											<p className='text-xs text-amber-600 mt-2'>
												В ближайшие 60 дней нет свободных слотов. Свяжитесь с
												мастером напрямую.
											</p>
										)}
									</div>
								) : (
									<div>
										<label className='text-sm text-gray-500 block mb-1.5'>
											{t('booking.select_time')}
										</label>
										<div className='grid grid-cols-4 gap-2'>
											{slots
												.filter(s => !isSlotPast(date, s))
												.map(s => (
													<button
														key={s}
														onClick={() => setTime(s)}
														className={`py-2 rounded-lg text-sm border transition-all ${time === s ? 'border-pink-400 bg-pink-50 text-pink-700 font-semibold' : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'}`}
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
									</div>
								)}

								{/* Phone */}
								<div>
									<label className='text-sm text-gray-500 block mb-1.5'>
										Телефон <span className='text-pink-500'>*</span>
									</label>
									<input
										type='tel'
										placeholder='+7 (999) 000-00-00'
										value={phone}
										onChange={e => setPhone(e.target.value)}
										className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100'
									/>
								</div>

								<input
									type='text'
									placeholder={t('booking.comment')}
									value={comment}
									onChange={e => setComment(e.target.value)}
									className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400'
								/>

								<div className='flex gap-2'>
									<button
										onClick={() => setStep(1)}
										className='flex-1 py-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors'
									>
										← Назад
									</button>
									<button
										disabled={!time}
										onClick={() => setStep(3)}
										className='flex-1 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all'
									>
										Далее →
									</button>
								</div>
							</div>
						)}

						{/* STEP 3 — Confirm */}
						{step === 3 && (
							<div>
								<div className='bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm mb-4'>
									{[
										['Услуги', selectedServices.join(', ')],
										['Длительность', `~${duration} ч`],
										['Дата', date],
										['Время', time],
										['Телефон', phone],
										['Итого', `${totalPrice} ₽`],
										...(comment ? [['Комментарий', comment]] : []),
									].map(([label, val]) => (
										<div key={label} className='flex justify-between gap-3'>
											<span className='text-gray-500 shrink-0'>{label}</span>
											<span className='font-medium text-right'>{val}</span>
										</div>
									))}
								</div>
								{error && (
									<p className='mb-3 text-sm text-red-500 text-center'>
										{error}
									</p>
								)}
								<div className='flex gap-2'>
									<button
										onClick={() => setStep(2)}
										className='flex-1 py-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50'
									>
										← Назад
									</button>
									<button
										onClick={book}
										disabled={loading}
										className='flex-1 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-semibold transition-all active:scale-[0.98]'
									>
										{loading ? (
											<span className='flex items-center justify-center gap-2'>
												<span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
												Отправка...
											</span>
										) : (
											t('booking.submit')
										)}
									</button>
								</div>
							</div>
						)}
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
