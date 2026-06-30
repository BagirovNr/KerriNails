import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { apiFetch } from '../../utils/api'

interface Props { onClose: () => void }

type Mode = 'login' | 'register' | 'forgot' | 'reset'

export default function AuthModal({ onClose }: Props) {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', code: '', newPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const h = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const go = (m: Mode) => { setMode(m); setError(''); setSuccess('') }

  const submit = async () => {
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        onClose()

      } else if (mode === 'register') {
        await register(form.name, form.phone, form.email, form.password)
        onClose()

      } else if (mode === 'forgot') {
        const res = await apiFetch('/api/auth/forgot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: form.phone })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setSuccess(data.message)
        setTimeout(() => go('reset'), 1500)

      } else if (mode === 'reset') {
        const res = await apiFetch('/api/auth/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: form.phone, code: form.code, newPassword: form.newPassword })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setSuccess('Пароль изменён! Войдите с новым паролем.')
        setTimeout(() => go('login'), 2000)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const TITLES: Record<Mode, string> = {
    login:    t('auth.login'),
    register: t('auth.register'),
    forgot:   'Восстановление пароля',
    reset:    'Новый пароль',
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 animate-fadeIn'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose}/>

      <div className='relative w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fadeInScale'>
        <div className='h-1 bg-gradient-to-r from-pink-400 to-rose-400'/>

        <div className='p-6 sm:p-8'>
          <h2 className='text-2xl font-bold text-gray-800 mb-1'>{TITLES[mode]}</h2>
          <p className='text-sm text-gray-400 mb-6'>Kerri Nails</p>

          <div className='space-y-3'>
            {mode === 'register' && (
              <>
                <input type='text' placeholder={t('auth.name')} value={form.name} onChange={h('name')}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
                <input type='tel' placeholder={t('auth.phone')} value={form.phone} onChange={h('phone')}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
              </>
            )}

            {(mode === 'login' || mode === 'register') && (
              <>
                <input type='email' placeholder={t('auth.email')} value={form.email} onChange={h('email')}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
                <input type='password' placeholder={t('auth.password')} value={form.password} onChange={h('password')}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <p className='text-sm text-gray-500 leading-relaxed'>
                  Введите номер телефона, указанный при регистрации. Код придёт администратору салона — он передаст его вам.
                </p>
                <input type='tel' placeholder='+7 (999) 000-00-00' value={form.phone} onChange={h('phone')}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
              </>
            )}

            {mode === 'reset' && (
              <>
                <p className='text-sm text-gray-500'>Введите телефон, код от администратора и новый пароль.</p>
                <input type='tel' placeholder='Телефон' value={form.phone} onChange={h('phone')}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
                <input type='text' placeholder='Код (4 цифры)' value={form.code} onChange={h('code')}
                  maxLength={4}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all tracking-widest text-center text-lg font-bold'/>
                <input type='password' placeholder='Новый пароль (мин. 6 символов)' value={form.newPassword} onChange={h('newPassword')}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
              </>
            )}
          </div>

          {error   && <p className='mt-3 text-sm text-red-500 text-center'>{error}</p>}
          {success && <p className='mt-3 text-sm text-green-600 text-center font-medium'>{success}</p>}

          <button onClick={submit} disabled={loading}
            className='mt-5 w-full py-3.5 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-semibold transition-all hover:shadow-md hover:shadow-pink-200 active:scale-[0.98]'>
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'/>
                Загрузка...
              </span>
            ) : (
              mode === 'login'    ? t('auth.login_btn') :
              mode === 'register' ? t('auth.register_btn') :
              mode === 'forgot'   ? 'Отправить запрос' :
                                    'Сменить пароль'
            )}
          </button>

          {/* Footer links */}
          <div className='mt-4 space-y-2 text-center text-sm'>
            {mode === 'login' && (
              <>
                <p className='text-gray-500'>
                  {t('auth.no_account')}{' '}
                  <button onClick={() => go('register')} className='text-pink-500 font-semibold hover:underline'>
                    {t('auth.register')}
                  </button>
                </p>
                <p>
                  <button onClick={() => go('forgot')} className='text-gray-400 hover:text-pink-500 transition-colors text-xs'>
                    Забыли пароль?
                  </button>
                </p>
              </>
            )}
            {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
              <p className='text-gray-500'>
                <button onClick={() => go('login')} className='text-pink-500 font-semibold hover:underline'>
                  ← Вернуться ко входу
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                <button onClick={() => go('reset')} className='text-gray-400 hover:text-pink-500 transition-colors text-xs'>
                  Уже есть код → ввести
                </button>
              </p>
            )}
          </div>
        </div>

        <button onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-lg'>
          ×
        </button>
      </div>
    </div>
  )
}
