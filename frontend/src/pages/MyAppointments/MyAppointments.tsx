import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
import RescheduleModal from '../../components/BookingForm/RescheduleModal'

interface Appointment {
	id: string
	service: string
	date: string
	time: string
	comment: string
	status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
	duration?: number
	createdAt: string
}

const STATUS_COLORS = {
	pending: 'bg-yellow-100 text-yellow-700',
	confirmed: 'bg-green-100 text-green-700',
	cancelled: 'bg-red-100 text-red-600',
	completed: 'bg-gray-100 text-gray-600',
}

// ─── Правило "не позднее 4 часов до начала" (совпадает с backend) ───────────
const MIN_HOURS_BEFORE_CHANGE = 4
const LOCKED_MESSAGE =
	'До начала процедуры осталось менее 4 часов. Изменение или отмена записи недоступны. Свяжитесь с мастером'
// Салон работает по московскому времени — считаем разницу в UTC+3, а не в
// часовом поясе браузера клиента, чтобы правило работало одинаково для всех.
const SALON_UTC_OFFSET_HOURS = 3

function hoursUntil(date: string, time: string): number {
	const startUtcMs =
		Date.parse(`${date}T${time}:00.000Z`) -
		SALON_UTC_OFFSET_HOURS * 60 * 60 * 1000
	return (startUtcMs - Date.now()) / (1000 * 60 * 60)
}

// ─── Блок подключения Telegram ───────────────────────────────────────────────

function TelegramConnect({ userId }: { userId: string }) {
	const [connected, setConnected] = useState<boolean | null>(null)

	const checkStatus = () => {
		apiFetch(`/api/telegram/status?userId=${userId}`)
			.then(r => r.json())
			.then(d => setConnected(d.connected))
			.catch(() => setConnected(false))
	}

	useEffect(() => {
		checkStatus()

		// Когда пользователь возвращается на вкладку (например, из Telegram) —
		// перепроверяем статус подключения
		const onFocus = () => checkStatus()
		const onVisibility = () => {
			if (document.visibilityState === 'visible') checkStatus()
		}
		window.addEventListener('focus', onFocus)
		document.addEventListener('visibilitychange', onVisibility)

		// Резервный опрос на случай, если событие фокуса не сработает
		const interval = setInterval(checkStatus, 5000)

		return () => {
			window.removeEventListener('focus', onFocus)
			document.removeEventListener('visibilitychange', onVisibility)
			clearInterval(interval)
		}
	}, [userId])

	const botUsername =
		import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'Kerrinailsbot'
	const link = `https://t.me/${botUsername}?start=${userId}`

	if (connected === null) return null // загружается

	if (connected) {
		return (
			<div className='flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4 mb-6'>
				<div className='w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0'>
					<svg viewBox='0 0 24 24' className='w-5 h-5 fill-current'>
						<path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
					</svg>
				</div>
				<div>
					<p className='font-semibold text-green-700 text-sm'>
						Telegram подключён
					</p>
					<p className='text-green-600 text-xs'>
						Вы будете получать уведомления о записях лично
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-4 mb-6'>
			<div className='flex items-start gap-3'>
				{/* Telegram icon */}
				<div className='w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center flex-shrink-0'>
					<svg viewBox='0 0 24 24' className='w-5 h-5 fill-white'>
						<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z' />
					</svg>
				</div>
				<div className='flex-1'>
					<p className='font-semibold text-gray-800 text-sm mb-0.5'>
						Подключите Telegram-уведомления
					</p>
					<p className='text-gray-500 text-xs mb-3'>
						Получайте подтверждение записи и напоминания прямо в Telegram —
						лично вам
					</p>
					<a
						href={link}
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9] hover:bg-[#1a8ec4] text-white text-xs font-semibold rounded-xl transition-colors'
					>
						<svg viewBox='0 0 24 24' className='w-4 h-4 fill-white'>
							<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z' />
						</svg>
						Подключить в Telegram
					</a>
				</div>
			</div>
		</div>
	)
}

export default function MyAppointments() {
	const { t } = useTranslation()
	const { token, user } = useAuth()
	const navigate = useNavigate()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(true)
	const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
		null,
	)
	const [actionError, setActionError] = useState<{
		id: string
		message: string
	} | null>(null)
	const [cancellingId, setCancellingId] = useState<string | null>(null)

	useEffect(() => {
		if (!user) {
			navigate('/home')
			return
		}
		apiFetch('/api/appointments/my', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(r => r.json())
			.then(data => setAppointments(data))
			.finally(() => setLoading(false))
	}, [token, user, navigate])

	const cancel = async (id: string) => {
		if (!confirm('Отменить запись?')) return
		setActionError(null)
		setCancellingId(id)
		try {
			const res = await apiFetch(`/api/appointments/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) {
				setActionError({
					id,
					message: data.error || 'Не удалось отменить запись',
				})
				return
			}
			setAppointments(prev =>
				prev.map(a => (a.id === id ? { ...a, status: 'cancelled' } : a)),
			)
		} finally {
			setCancellingId(null)
		}
	}

	const handleRescheduled = (updated: Appointment) => {
		setAppointments(prev =>
			prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a)),
		)
	}

	return (
		<div className='py-12 px-4 max-w-3xl mx-auto'>
			<h1
				className='text-3xl font-bold text-gray-800 mb-2'
				style={{ fontFamily: 'Georgia, serif' }}
			>
				{t('booking.my_appointments')}
			</h1>
			<p className='text-gray-400 mb-6'>Привет, {user?.name} 👋</p>

			{user && <TelegramConnect userId={user.id} />}

			{loading ? (
				<div className='flex items-center justify-center py-16'>
					<div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
				</div>
			) : appointments.length === 0 ? (
				<div className='text-center py-16 bg-gray-50 rounded-2xl'>
					<div className='text-5xl mb-4'>💅</div>
					<p className='text-gray-500'>У вас пока нет записей</p>
					<button
						onClick={() => navigate('/services')}
						className='mt-4 px-6 py-2.5 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors'
					>
						Посмотреть услуги
					</button>
				</div>
			) : (
				<div className='flex flex-col gap-4'>
					{[...appointments]
						.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						)
						.map(a => {
							const manageable =
								a.status === 'pending' || a.status === 'confirmed'
							const locked =
								manageable &&
								hoursUntil(a.date, a.time) < MIN_HOURS_BEFORE_CHANGE

							return (
								<div
									key={a.id}
									className='bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow'
								>
									<div className='flex items-start justify-between gap-3'>
										<div className='flex-1'>
											<p className='font-semibold text-gray-800 mb-1'>
												{a.service}
											</p>
											<p className='text-sm text-gray-500'>
												📅 {a.date} · ⏰ {a.time}
											</p>
											{a.comment && (
												<p className='text-sm text-gray-400 mt-1 italic'>
													"{a.comment}"
												</p>
											)}
										</div>
										<span
											className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[a.status]}`}
										>
											{t(`booking.status_${a.status}`)}
										</span>
									</div>

									{manageable && (
										<div className='mt-3 pt-3 border-t border-gray-100'>
											{locked ? (
												<p className='text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-1.5'>
													<span className='shrink-0'>⏰</span>
													<span>{LOCKED_MESSAGE}</span>
												</p>
											) : (
												<div className='flex items-center gap-4'>
													<button
														onClick={() => setRescheduleTarget(a)}
														className='text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors flex items-center gap-1'
													>
														🔁 Перенести
													</button>
													<button
														onClick={() => cancel(a.id)}
														disabled={cancellingId === a.id}
														className='text-sm text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors'
													>
														{cancellingId === a.id
															? 'Отмена...'
															: `${t('booking.cancel')} запись`}
													</button>
												</div>
											)}
											{actionError?.id === a.id && (
												<p className='text-xs text-red-500 mt-2'>
													{actionError.message}
												</p>
											)}
										</div>
									)}
								</div>
							)
						})}
				</div>
			)}

			{rescheduleTarget && (
				<RescheduleModal
					appointment={rescheduleTarget}
					onClose={() => setRescheduleTarget(null)}
					onRescheduled={handleRescheduled}
				/>
			)}
		</div>
	)
}
