import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className='min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col items-center justify-center px-4 text-center'>
      <div className='text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-4'>404</div>
      <h2 className='text-2xl font-bold text-gray-800 mb-3' style={{ fontFamily: 'Georgia, serif' }}>
        {t('notFound.title')}
      </h2>
      <p className='text-gray-500 mb-8 max-w-sm'>{t('notFound.text')}</p>
      <Link to='/home'
        className='px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-pink-200'>
        {t('notFound.back')}
      </Link>
    </div>
  )
}
