import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePortfolio, type PortfolioItem as PortfolioItemType } from '../../hooks/usePortfolio'

type Category = 'all' | 'manicure' | 'pedicure' | 'design' | 'extension'

const FILTERS: { key: Category; tKey: string }[] = [
  { key: 'all',       tKey: 'portfolio.filter_all' },
  { key: 'manicure',  tKey: 'portfolio.filter_manicure' },
  { key: 'pedicure',  tKey: 'portfolio.filter_pedicure' },
  { key: 'design',    tKey: 'portfolio.filter_design' },
  { key: 'extension', tKey: 'portfolio.filter_extension' },
]

function PortfolioItem({ item, delay }: { item: PortfolioItemType; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        onClick={() => setLightbox(true)}
        className={`cursor-pointer overflow-hidden rounded-2xl group transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className='relative overflow-hidden aspect-square'>
          <img src={item.imageData} alt={item.description} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'/>
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
            <p className='text-white text-sm font-medium'>{item.description}</p>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className='fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 animate-fadeIn' onClick={() => setLightbox(false)}>
          <img src={item.imageData} alt={item.description} className='max-w-full max-h-full rounded-xl object-contain animate-fadeInScale'/>
          <button className='absolute top-4 right-4 text-white text-3xl hover:text-pink-400 transition-colors'>×</button>
          <p className='absolute bottom-6 text-white text-sm font-medium'>{item.description}</p>
        </div>
      )}
    </>
  )
}

export default function Portfolio() {
  const { t } = useTranslation()
  const { items, loading } = usePortfolio()
  const [active, setActive] = useState<Category>('all')

  const filtered = active === 'all' ? items : items.filter(i => i.category === active)

  return (
    <div className='py-12 px-4 max-w-6xl mx-auto'>
      <h1 className='text-4xl font-bold text-gray-800 mb-2 text-center' style={{ fontFamily: 'Georgia, serif' }}>
        {t('portfolio.title')}
      </h1>
      <p className='text-gray-400 text-center mb-8'>Нажмите на фото для увеличения</p>

      {/* Filters */}
      <div className='flex flex-wrap justify-center gap-2 mb-10'>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setActive(f.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              active === f.key
                ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600'
            }`}>
            {t(f.tKey)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className='flex justify-center py-16'>
          <div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <p className='text-center text-gray-400 py-16'>Пока нет фото в этой категории</p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
          {filtered.map((item, i) => (
            <PortfolioItem key={item.id} item={item} delay={i * 60}/>
          ))}
        </div>
      )}
    </div>
  )
}
