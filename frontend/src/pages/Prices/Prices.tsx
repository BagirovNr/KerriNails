import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SERVICES } from '../../utils/data'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../../components/forms/AuthModal'
import BookingModal from '../../components/BookingForm/BookingModal'

const CATS = ['all','manicure','pedicure','design','extension','care']
const LABELS: Record<string, string> = { all:'Все', manicure:'Маникюр', pedicure:'Педикюр', design:'Дизайн', extension:'Наращивание', care:'Уход' }

export default function Prices() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [cat, setCat] = useState('all')
  const [authOpen, setAuthOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const handleBook = () => user ? setBookOpen(true) : setAuthOpen(true)

  const filtered = cat === 'all' ? SERVICES : SERVICES.filter(s => s.category === cat)

  return (
    <div className='py-12 px-4 max-w-5xl mx-auto'>
      <h1 className='text-4xl font-bold text-gray-800 mb-2 text-center' style={{ fontFamily: 'Georgia, serif' }}>{t('prices.title')}</h1>
      <p className='text-gray-400 text-center mb-8'>{t('prices.subtitle')}</p>

      <div className='flex flex-wrap justify-center gap-2 mb-8'>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              cat === c ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
            }`}>{LABELS[c]}</button>
        ))}
      </div>

      <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm'>
        {filtered.map((s, i) => (
          <div key={s.id} className={`flex items-center justify-between px-5 py-4 hover:bg-pink-50/50 transition-colors ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
            <div className='flex-1'>
              <p className='font-medium text-gray-800'>{s.name}</p>
              <p className='text-sm text-gray-400 mt-0.5 hidden sm:block'>{s.description}</p>
            </div>
            <div className='flex items-center gap-4 ml-4'>
              <span className='font-bold text-pink-500 whitespace-nowrap'>{s.price} ₽</span>
              <button onClick={handleBook}
                className='px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg font-medium transition-all hidden sm:block'>
                {t('prices.book')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 text-center'>
        <button onClick={handleBook}
          className='px-8 py-3.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-pink-200 sm:hidden'>
          {t('prices.book')}
        </button>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
    </div>
  )
}
