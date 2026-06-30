import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Panel = 'call' | 'email' | null

export default function ContactPanel() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<Panel>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const h = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setStatus('sending')
    // emailjs integration point — вставьте свои ключи в .env
    // await emailjs.send(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY)
    await new Promise(r => setTimeout(r, 1000)) // simulate
    setStatus('sent')
    setTimeout(() => { setStatus('idle'); setOpen(null); setForm({ name:'', phone:'', email:'', message:'' }) }, 2000)
  }

  const icons = {
    call:  <path d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z'/>,
    email: <path d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/>,
  }

  return (
    <>
      {/* Floating icons */}
      <div className={`fixed top-1/2 -translate-y-1/2 right-0 z-40 flex flex-col items-center gap-2 transition-transform duration-500 ${open ? '-translate-x-80 sm:-translate-x-96' : 'translate-x-0'}`}>
        {(['call', 'email'] as const).map(type => (
          <button key={type} onClick={() => setOpen(o => o === type ? null : type)}
            className={`w-11 h-11 rounded-l-xl flex items-center justify-center shadow-md transition-all ${
              open === type ? 'bg-pink-600 text-white' : 'bg-white hover:bg-pink-50 text-pink-500'
            }`}>
            <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>{icons[type]}</svg>
          </button>
        ))}
      </div>

      {/* Side panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 max-w-full bg-white shadow-2xl z-[45] transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {open && (
          <>
            <div className='h-1 bg-gradient-to-r from-pink-400 to-rose-400'/>
            <div className='flex-1 p-6 sm:p-8 flex flex-col'>
              <button onClick={() => setOpen(null)} className='self-end mb-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl transition-colors'>×</button>

              <h3 className='text-2xl font-bold text-gray-800 mb-1'>
                {open === 'call' ? t('forms.call_title') : t('forms.email_title')}
              </h3>
              <p className='text-sm text-gray-400 mb-6'>
                {open === 'call' ? t('forms.call_sub') : t('forms.email_sub')}
              </p>

              {status === 'sent' ? (
                <div className='flex-1 flex flex-col items-center justify-center text-center gap-4'>
                  <div className='text-5xl'>✅</div>
                  <p className='text-lg font-semibold text-gray-700'>{t('forms.sent')}</p>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  <input type='text' placeholder={t('forms.name')} value={form.name} onChange={h('name')}
                    className='px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
                  {open === 'call' && (
                    <input type='tel' placeholder={t('forms.phone')} value={form.phone} onChange={h('phone')}
                      className='px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
                  )}
                  {open === 'email' && (
                    <>
                      <input type='email' placeholder={t('forms.email')} value={form.email} onChange={h('email')}
                        className='px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all'/>
                      <textarea placeholder={t('forms.message')} value={form.message} onChange={h('message')} rows={4}
                        className='px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none'/>
                    </>
                  )}
                  <button onClick={submit} disabled={status === 'sending'}
                    className='mt-2 py-3.5 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl font-semibold transition-all hover:shadow-md'>
                    {status === 'sending' ? t('forms.sending') : t('forms.send')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {open && <div className='fixed inset-0 bg-black/40 z-[44] transition-opacity' onClick={() => setOpen(null)}/>}
    </>
  )
}
