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
  date: string
  time: string
  comment: string
  status: string
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
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
}

type Tab = 'appointments' | 'clients' | 'stats'

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
    if (!user) { navigate('/home'); return }
    if (user.role !== 'admin') { navigate('/home'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [appts, st] = await Promise.all([
      apiFetch('/api/admin/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      apiFetch('/api/admin/stats',        { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
    setAppointments(appts)
    setStats(st)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/api/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    loadData()
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const TABS: { key: Tab; label: string }[] = [
    { key: 'appointments', label: t('admin.appointments') },
    { key: 'stats',        label: t('admin.stats') },
  ]

  return (
    <div className='py-10 px-4 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-800' style={{ fontFamily: 'Georgia, serif' }}>
          {t('admin.title')}
        </h1>
        <span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold'>Admin</span>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 mb-6 border-b border-gray-200'>
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === tb.key ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin'/>
        </div>
      ) : (
        <>
          {/* Stats tab */}
          {tab === 'stats' && stats && (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
              {[
                { label: 'Всего записей', value: stats.total, color: 'bg-gray-50' },
                { label: 'Ожидают', value: stats.pending, color: 'bg-yellow-50' },
                { label: 'Подтверждены', value: stats.confirmed, color: 'bg-green-50' },
                { label: 'Завершены', value: stats.completed, color: 'bg-blue-50' },
                { label: 'Отменены', value: stats.cancelled, color: 'bg-red-50' },
                { label: 'Клиентов', value: stats.totalClients, color: 'bg-purple-50' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-5 text-center`}>
                  <p className='text-3xl font-bold text-gray-800 mb-1'>{s.value}</p>
                  <p className='text-xs text-gray-500'>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Appointments tab */}
          {tab === 'appointments' && (
            <>
              {/* Filter */}
              <div className='flex flex-wrap gap-2 mb-5'>
                {['all','pending','confirmed','completed','cancelled'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filter === f ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {f === 'all' ? 'Все' : t(`booking.status_${f}`)}
                    {f !== 'all' && stats && (
                      <span className='ml-1 opacity-70'>({(stats as any)[f] ?? 0})</span>
                    )}
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
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-500'}`}>
                              {t(`booking.status_${a.status}`)}
                            </span>
                          </div>
                          <p className='text-sm text-gray-500 mt-0.5'>{a.userEmail}</p>
                          {a.userPhone && <p className='text-sm text-pink-600 font-medium'>📞 {a.userPhone}</p>}
                          <p className='text-sm text-gray-700 mt-1 font-medium'>{a.service}</p>
                          <p className='text-sm text-gray-400'>📅 {a.date} · ⏰ {a.time}</p>
                          {a.comment && <p className='text-xs text-gray-400 mt-1 italic'>"{a.comment}"</p>}
                        </div>

                        {/* Action buttons */}
                        <div className='flex flex-wrap gap-2 shrink-0'>
                          {a.status === 'pending' && (
                            <button onClick={() => updateStatus(a.id, 'confirmed')}
                              className='px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-colors'>
                              ✓ {t('admin.confirm')}
                            </button>
                          )}
                          {(a.status === 'pending' || a.status === 'confirmed') && (
                            <button onClick={() => updateStatus(a.id, 'completed')}
                              className='px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors'>
                              ✓✓ {t('admin.complete')}
                            </button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button onClick={() => updateStatus(a.id, 'cancelled')}
                              className='px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg font-medium transition-colors'>
                              ✕ {t('admin.cancel')}
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
