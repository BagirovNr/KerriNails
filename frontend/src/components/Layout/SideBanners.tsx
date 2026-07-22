import { useBanners, type Banner } from '../../hooks/useBanners'

function BannerContent({ banner }: { banner: Banner }) {
	const hasImage = Boolean(banner.imageData)
	const isLink = Boolean(banner.linkUrl)

	if (hasImage) {
		return (
			<div className='relative aspect-[3/4] overflow-hidden'>
				<img
					src={banner.imageData!}
					alt={banner.text || 'Акция'}
					className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
				/>
				{banner.text && (
					<div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8'>
						<p className='text-white text-xs font-medium leading-snug whitespace-pre-line'>{banner.text}</p>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className='relative p-5 overflow-hidden'>
			{/* мягкое свечение в углу — фирменный акцент карточки */}
			<div className='absolute -top-6 -right-6 w-24 h-24 rounded-full bg-pink-200/40 blur-2xl pointer-events-none' />

			<div className='relative flex items-center gap-1.5 mb-3'>
				<span className='text-amber-400 text-[10px]'>✦</span>
				<span className='text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400'>Акция</span>
			</div>
			<div className='relative h-px w-8 bg-gradient-to-r from-amber-300 to-transparent mb-3' />

			<p
				className='relative text-gray-800 text-base leading-snug italic whitespace-pre-line'
				style={{ fontFamily: 'Georgia, serif' }}
			>
				{banner.text}
			</p>

			{isLink && (
				<p className='relative mt-4 text-xs font-medium text-pink-500 flex items-center gap-1 group-hover:gap-2 transition-all'>
					Подробнее
					<span className='transition-transform group-hover:translate-x-0.5'>→</span>
				</p>
			)}
		</div>
	)
}

function BannerCard({ banner }: { banner: Banner }) {
	const hasImage = Boolean(banner.imageData)
	const isLink = Boolean(banner.linkUrl)

	const cardClass = `group block w-44 rounded-3xl overflow-hidden transition-all duration-300 ${
		isLink ? 'hover:-translate-y-0.5 cursor-pointer' : ''
	} ${
		hasImage
			? 'shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15'
			: 'bg-gradient-to-b from-white to-pink-50/60 border border-pink-100 shadow-lg shadow-pink-100/50 hover:shadow-xl hover:shadow-pink-200/60'
	}`

	if (isLink) {
		return (
			<a href={banner.linkUrl} target='_blank' rel='noopener noreferrer' className={cardClass}>
				<BannerContent banner={banner} />
			</a>
		)
	}

	return (
		<div className={cardClass}>
			<BannerContent banner={banner} />
		</div>
	)
}

export default function SideBanners() {
	const { banners } = useBanners()
	if (banners.length === 0) return null

	// Один активный баннер — показываем зеркально по обе стороны.
	// Два и больше — разные баннеры слева и справа (остальные пока не показываем).
	const left = banners[0]
	const right = banners.length > 1 ? banners[1] : banners[0]

	return (
		<>
			<div className='hidden 2xl:block fixed left-6 top-1/2 -translate-y-1/2 z-30'>
				<BannerCard key={`left-${left.id}`} banner={left} />
			</div>
			<div className='hidden 2xl:block fixed right-6 top-1/2 -translate-y-1/2 z-30'>
				<BannerCard key={`right-${right.id}`} banner={right} />
			</div>
		</>
	)
}
