import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SERVICES } from '../../utils/data'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../../components/forms/AuthModal'
import BookingModal from '../../components/BookingForm/BookingModal'

const CATS = ['all','manicure','pedicure','design','extension','care']
const CAT_LABELS: Record<string, string> = {
  all: 'Все', manicure: 'Маникюр', pedicure: 'Педикюр',
  design: 'Дизайн', extension: 'Наращивание', care: 'Уход'
}

export default function Services() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [cat, setCat] = useState('all')
  const [authOpen, setAuthOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)

  const filtered = cat === 'all' ? SERVICES : SERVICES.filter(s => s.category === cat)
  const handleBook = () => user ? setBookOpen(true) : setAuthOpen(true)

  return (
    <div className='py-12 px-4 max-w-6xl mx-auto'>
      <h1 className='text-4xl font-bold text-gray-800 mb-2 text-center' style={{ fontFamily: 'Georgia, serif' }}>
        {t('services.title')}
      </h1>
      <p className='text-gray-400 text-center mb-8'>Профессиональный уход за ногтями</p>

      <div className='flex flex-wrap justify-center gap-2 mb-10'>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              cat === c ? 'bg-pink-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filtered.map(s => (
          <div key={s.id} className='group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-1'>
            <div className='h-48 overflow-hidden relative'>
              <img src={s.img} alt={s.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'/>
              <span className='absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-semibold rounded-full'>
                {CAT_LABELS[s.category]}
              </span>
            </div>
            <div className='p-5'>
              <h3 className='font-bold text-gray-800 mb-2'>{s.name}</h3>
              <p className='text-gray-500 text-sm mb-4 leading-relaxed'>{s.description}</p>
              <div className='flex items-center justify-between'>
                <span className='text-2xl font-bold text-pink-500'>{s.price} ₽</span>
                <button onClick={handleBook}
                  className='px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95'>
                  {t('services.book')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
    </div>
  )
}
