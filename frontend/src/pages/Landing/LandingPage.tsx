import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../../components/forms/AuthModal'
import BookingModal from '../../components/BookingForm/BookingModal'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher'
import logo from '../../assets/logo.png'

const TILES = (t: (k: string) => string, onBook: () => void) => [
  { label: t('landing.book'),      action: 'book',    gradient: 'from-pink-500 to-rose-500',   emoji: '💅' },
  { label: t('landing.prices'),    href: '/prices',   gradient: 'from-purple-500 to-pink-500',  emoji: '💰' },
  { label: t('landing.portfolio'), href: '/portfolio',gradient: 'from-rose-400 to-orange-400',  emoji: '✨' },
  { label: t('landing.review'),    href: 'https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true', external: true, gradient: 'from-green-400 to-emerald-500', emoji: '⭐' },
]

export default function LandingPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)

  const handleBook = () => user ? setBookOpen(true) : setAuthOpen(true)

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-950 via-rose-950 to-gray-900 flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden'>
      {/* Background orbs */}
      <div className='absolute top-20 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none'/>
      <div className='absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none'/>

      {/* Language switcher */}
      <div className='absolute top-5 right-5 z-10'>
        <LanguageSwitcher />
      </div>

      {/* Logo */}
      <div className='mb-2 animate-fadeInScale'>
        <img src={logo} alt='Kerri Nails' className='w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-xl'/>
      </div>

      <h1 className='text-4xl font-black text-center mb-1 text-white tracking-tight animate-fadeInUp' style={{ fontFamily: 'Georgia, serif' }}>
        Kerri <span className='text-pink-400'>Nails</span>
      </h1>
      <p className='text-gray-400 text-sm text-center mb-8 animate-fadeInUp'>{t('landing.subtitle')}</p>

      {/* 2×2 grid */}
      <div className='grid grid-cols-2 gap-3 w-full max-w-xs animate-fadeInUp'>
        {TILES(t, handleBook).map(tile => {
          const inner = (
            <div className={`bg-gradient-to-br ${tile.gradient} p-0.5 rounded-2xl`}>
              <div className='bg-gray-900/80 backdrop-blur-sm rounded-[14px] px-4 py-5 text-center flex flex-col items-center gap-2 hover:bg-gray-800/80 active:scale-95 transition-all duration-200'>
                <span className='text-2xl'>{tile.emoji}</span>
                <span className='text-white font-semibold text-sm leading-tight'>{tile.label}</span>
              </div>
            </div>
          )
          if (tile.action === 'book') return <button key={tile.label} onClick={handleBook} className='block'>{inner}</button>
          if (tile.external) return <a key={tile.label} href={tile.href} target='_blank' rel='noopener noreferrer' className='block'>{inner}</a>
          return <Link key={tile.label} to={tile.href!} className='block'>{inner}</Link>
        })}
      </div>

      {/* Full site link */}
      <Link to='/home' className='mt-8 text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4'>
        Перейти на полный сайт →
      </Link>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
    </div>
  )
}
