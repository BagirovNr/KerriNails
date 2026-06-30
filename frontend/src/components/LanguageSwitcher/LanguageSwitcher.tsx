import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n/main'

const LANGS = [
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'uz', label: "O'zbek",     flag: '🇺🇿' },
  { code: 'hy', label: 'Հայերեն',   flag: '🇦🇲' },
]

export default function LanguageSwitcher() {
  const { i18n: i18nHook } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGS.find(l => l.code === i18nHook.language) || LANGS[0]

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const change = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setOpen(false)
  }

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(o => !o)}
        className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50 transition-all text-sm font-medium text-gray-700 select-none'
        aria-label='Язык / Language'
      >
        <span className='text-base leading-none'>{current.flag}</span>
        <span className='hidden sm:inline'>{current.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox='0 0 12 8' fill='none'>
          <path d='M1 1l5 5 5-5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
        </svg>
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn'>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
                ${lang.code === i18nHook.language
                  ? 'bg-pink-50 text-pink-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span className='text-base'>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === i18nHook.language && (
                <svg className='ml-auto w-4 h-4 text-pink-500' viewBox='0 0 16 16' fill='currentColor'>
                  <path d='M13.5 3.5L6 11 2.5 7.5' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round'/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
