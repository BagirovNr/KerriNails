import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'

interface Appointment {
  id: string
  service: string
  date: string
  time: string
  comment: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
}

export default function MyAppointments() {
  const { t } = useTranslation()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/home'); return }
    apiFetch('/api/appointments/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setAppointments(data))
      .finally(() => setLoading(false))
  }, [token, user, navigate])

  const cancel = async (id: string) => {
    if (!confirm('Отменить запись?')) return
    await apiFetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
  }

  return (
    <div className='py-12 px-4 max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Georgia, serif' }}>
        {t('booking.my_appointments')}
      </h1>
      <p className='text-gray-400 mb-8'>Привет, {user?.name} 👋</p>

      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin'/>
        </div>
      ) : appointments.length === 0 ? (
        <div className='text-center py-16 bg-gray-50 rounded-2xl'>
          <div className='text-5xl mb-4'>💅</div>
          <p className='text-gray-500'>У вас пока нет записей</p>
          <button onClick={() => navigate('/services')}
            className='mt-4 px-6 py-2.5 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors'>
            Посмотреть услуги
          </button>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {[...appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(a => (
            <div key={a.id} className='bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between gap-3'>
                <div className='flex-1'>
                  <p className='font-semibold text-gray-800 mb-1'>{a.service}</p>
                  <p className='text-sm text-gray-500'>📅 {a.date} · ⏰ {a.time}</p>
                  {a.comment && <p className='text-sm text-gray-400 mt-1 italic'>"{a.comment}"</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[a.status]}`}>
                  {t(`booking.status_${a.status}`)}
                </span>
              </div>
              {a.status === 'pending' && (
                <div className='mt-3 pt-3 border-t border-gray-100'>
                  <button onClick={() => cancel(a.id)}
                    className='text-sm text-red-400 hover:text-red-600 transition-colors'>
                    {t('booking.cancel')} запись
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
