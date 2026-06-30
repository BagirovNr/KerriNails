import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { SERVICES } from '../../utils/data'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../../components/forms/AuthModal'
import BookingModal from '../../components/BookingForm/BookingModal'
import hero1 from '../../assets/nails.jpg'
import hero2 from '../../assets/nails2.jpg'
import hero3 from '../../assets/nails3.jpg'

const WHY = [
  { icon: '💎', key: 'why1' },
  { icon: '🎓', key: 'why2' },
  { icon: '✨', key: 'why3' },
  { icon: '📅', key: 'why4' },
]

export default function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const handleBook = () => user ? setBookOpen(true) : setAuthOpen(true)

  return (
    <>
      {/* Hero */}
      <section className='relative overflow-hidden bg-gradient-to-br from-gray-50 to-pink-50 py-16 sm:py-24 px-4'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10'>
          <div className='flex-1 text-center md:text-left'>
            <span className='inline-block px-3 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase'>
              Санкт-Петербург
            </span>
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-4' style={{ fontFamily: 'Georgia, serif' }}>
              {t('home.hero_title')}
            </h1>
            <p className='text-lg text-gray-500 mb-8 max-w-md mx-auto md:mx-0'>{t('home.hero_sub')}</p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center md:justify-start'>
              <button onClick={handleBook}
                className='px-8 py-3.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold text-base transition-all hover:shadow-lg hover:shadow-pink-200 active:scale-95'>
                {t('home.book_btn')}
              </button>
              <Link to='/portfolio'
                className='px-8 py-3.5 border border-gray-200 hover:border-pink-300 rounded-full font-medium text-gray-600 hover:text-pink-600 transition-all text-base text-center'>
                Портфолио
              </Link>
            </div>
          </div>
          <div className='flex-1 flex gap-3 justify-center'>
            <div className='flex flex-col gap-3'>
              <img src={hero1} alt='nail' className='w-32 h-40 object-cover rounded-2xl shadow-md'/>
              <img src={hero3} alt='nail' className='w-32 h-28 object-cover rounded-2xl shadow-md'/>
            </div>
            <div className='flex flex-col gap-3 mt-6'>
              <img src={hero2} alt='nail' className='w-32 h-28 object-cover rounded-2xl shadow-md'/>
              <img src={hero1} alt='nail' className='w-32 h-40 object-cover rounded-2xl shadow-md'/>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className='py-16 px-4 bg-white'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2 text-center' style={{ fontFamily: 'Georgia, serif' }}>{t('home.services_title')}</h2>
          <p className='text-gray-400 text-center mb-10'>Выберите процедуру и запишитесь онлайн</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {SERVICES.slice(0, 4).map((s, i) => (
              <div key={s.id}
                className='group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-1'
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className='h-40 overflow-hidden'>
                  <img src={s.img} alt={s.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'/>
                </div>
                <div className='p-4'>
                  <h3 className='font-semibold text-gray-800 text-sm mb-1'>{s.name}</h3>
                  <p className='text-pink-500 font-bold text-base mb-3'>{s.price} ₽</p>
                  <button onClick={handleBook}
                    className='w-full py-2 bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white rounded-xl text-sm font-medium transition-all'>
                    {t('services.book')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className='text-center mt-8'>
            <Link to='/services' className='inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium'>
              Все услуги <span className='text-lg'>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className='py-16 px-4 bg-gradient-to-br from-pink-50 to-rose-50'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-800 mb-10 text-center' style={{ fontFamily: 'Georgia, serif' }}>{t('home.why_title')}</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {WHY.map(w => (
              <div key={w.key} className='bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow'>
                <div className='text-3xl mb-3'>{w.icon}</div>
                <h3 className='font-semibold text-gray-800 mb-1 text-sm'>{t(`home.${w.key}_title`)}</h3>
                <p className='text-gray-500 text-xs leading-relaxed'>{t(`home.${w.key}_text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 px-4 bg-gray-900 text-center'>
        <h2 className='text-3xl font-bold text-white mb-3' style={{ fontFamily: 'Georgia, serif' }}>Готовы к идеальному маникюру?</h2>
        <p className='text-gray-400 mb-8'>Запишитесь онлайн прямо сейчас — мастер ждёт вас</p>
        <button onClick={handleBook}
          className='px-10 py-4 bg-pink-500 hover:bg-pink-400 text-white rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-pink-500/30 active:scale-95'>
          {t('home.book_btn')}
        </button>
      </section>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
    </>
  )
}
