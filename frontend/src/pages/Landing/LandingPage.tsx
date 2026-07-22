<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
=======
<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
=======
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
>>>>>>> ec29853f4cfcc07ca7a9ccccf493547b18e981a2
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../../components/forms/AuthModal'
import BookingModal from '../../components/BookingForm/BookingModal'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher'
import { SOCIAL_LINKS } from '../../utils/social'
import { FaWhatsapp, FaTelegram } from 'react-icons/fa6'
import posterImg from '../../assets/nails3.jpg'

const DROP_PATHS = [
	'M9,0 C13,2 14,8 9,13 C4,17 -2,13 0,7 C1,3 5,-2 9,0 Z',
	'M11,0 C16,1 17,9 11,14 C6,18 -1,13 1,7 C2,2 6,-2 11,0 Z',
	'M8,0 C12,1 13,7 8,12 C3,16 -2,11 0,6 C1,2 4,-1 8,0 Z',
	'M10,0 C15,2 15,10 9,14 C4,17 -2,12 1,6 C2,2 6,-1 10,0 Z',
]

const DROP_COLORS = [
	{ stroke: 'rgba(233,201,160,0.9)', fill: 'rgba(233,201,160,0.28)' },
	{ stroke: 'rgba(217,175,134,0.9)', fill: 'rgba(217,175,134,0.24)' },
	{ stroke: 'rgba(246,238,228,0.85)', fill: 'rgba(246,238,228,0.18)' },
	{ stroke: 'rgba(185,138,78,0.95)', fill: 'rgba(185,138,78,0.3)' },
]

function LacquerDrops({ count = 18 }: { count?: number }) {
	const ref = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			if (!ref.current) return

			const mm = gsap.matchMedia()

			mm.add(
				{
					reduceMotion: '(prefers-reduced-motion: reduce)',
					isCompact: '(max-width: 640px)',
				},
				(context: any) => {
					const conditions = context.conditions as {
						reduceMotion: boolean
						isCompact: boolean
					}
					const { reduceMotion, isCompact } = conditions
					if (reduceMotion) return

					const drops =
						ref.current!.querySelectorAll<SVGElement>('.lacquer-drop')
					const activeCount = isCompact ? Math.min(count, 10) : count

					drops.forEach((svg, i) => {
						if (i >= activeCount) {
							gsap.set(svg, { opacity: 0 })
							return
						}
						const path = svg.querySelector('path')!
						const len = path.getTotalLength?.() || 40

						const place = () =>
							gsap.set(svg, {
								x: gsap.utils.random(0, window.innerWidth),
								y: gsap.utils.random(
									window.innerHeight * 0.65,
									window.innerHeight * 1.05,
								),
								rotation: gsap.utils.random(0, 360),
								scale: gsap.utils.random(0.5, 1.3),
							})

						place()
						gsap.set(svg, { opacity: 0 })
						gsap.set(path, {
							strokeDasharray: len,
							strokeDashoffset: len,
							fillOpacity: 0,
						})

						const tl = gsap.timeline({
							delay: i * 0.22 + gsap.utils.random(0.2, 2.2),
							repeat: -1,
							repeatDelay: gsap.utils.random(3, 7),
							onRepeat: () => {
								place()
								gsap.set(path, { strokeDashoffset: len, fillOpacity: 0 })
							},
						})

						tl.to(svg, { opacity: 1, duration: 0.35, ease: 'power2.out' })
							.to(
								path,
								{ strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' },
								'<',
							)
							.to(
								path,
								{ fillOpacity: 1, duration: 0.45, ease: 'power1.out' },
								'-=0.25',
							)
							.to(
								svg,
								{
									y: `-=${gsap.utils.random(220, 480)}`,
									x: `+=${gsap.utils.random(-90, 90)}`,
									rotation: `+=${gsap.utils.random(-60, 60)}`,
									duration: gsap.utils.random(7, 13),
									ease: 'none',
								},
								'-=0.15',
							)
							.to(svg, { opacity: 0, duration: 1.4, ease: 'power1.in' }, '-=2')
					})

					return () => {
						drops.forEach(svg => gsap.killTweensOf(svg))
					}
				},
			)

			return () => mm.revert()
		},
		{ scope: ref },
	)

	return (
		<div
			ref={ref}
			className='absolute inset-0 overflow-hidden pointer-events-none'
			style={{ zIndex: 3 }}
		>
			{Array.from({ length: count }).map((_, i) => {
				const color = DROP_COLORS[i % DROP_COLORS.length]
				const d = DROP_PATHS[i % DROP_PATHS.length]
				const size = 16 + (i % 4) * 6
				return (
					<svg
						key={i}
						className='lacquer-drop absolute'
						width={size}
						height={size}
						viewBox='-3 -3 22 22'
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							willChange: 'transform, opacity',
						}}
					>
						<path
							d={d}
							stroke={color.stroke}
							strokeWidth='1.1'
							fill={color.fill}
							fillOpacity='0'
							style={{ filter: 'drop-shadow(0 1px 3px rgba(185,138,78,0.35))' }}
						/>
					</svg>
				)
			})}
		</div>
	)
}

function GlitterLayer() {
	const ref = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			if (!ref.current) return
			const mm = gsap.matchMedia()

			mm.add('(prefers-reduced-motion: no-preference)', () => {
				const dots = ref.current!.querySelectorAll<HTMLElement>('.glitter')
				dots.forEach((dot, i) => {
					gsap.set(dot, {
						x: gsap.utils.random(0, window.innerWidth),
						y: gsap.utils.random(0, window.innerHeight),
						opacity: 0,
						scale: 0,
					})
					gsap.to(dot, {
						opacity: gsap.utils.random(0.25, 0.75),
						scale: 1,
						duration: 0.5,
						delay: i * 0.1 + 1.6,
						ease: 'back.out(2.4)',
						yoyo: true,
						repeat: -1,
						repeatDelay: gsap.utils.random(1.8, 5),
						x: `+=${gsap.utils.random(-50, 50)}`,
						y: `+=${gsap.utils.random(-70, 70)}`,
					})
				})

				return () => {
					dots.forEach(dot => gsap.killTweensOf(dot))
				}
			})

			return () => mm.revert()
		},
		{ scope: ref },
	)

	return (
		<div
			ref={ref}
			className='absolute inset-0 overflow-hidden pointer-events-none'
			style={{ zIndex: 2 }}
		>
			{Array.from({ length: 20 }).map((_, i) => (
				<div
					key={i}
					className='glitter absolute rounded-full'
					style={{
						width: `${1.5 + (i % 3) * 1.5}px`,
						height: `${1.5 + (i % 3) * 1.5}px`,
						background: i % 2 === 0 ? '#F6EEE4' : '#E9C9A0',
						boxShadow: '0 0 5px rgba(233,201,160,0.9)',
						willChange: 'transform, opacity',
					}}
				/>
			))}
		</div>
	)
}

export default function LandingPage() {
	const { t } = useTranslation()
	const { user, loading } = useAuth()
	const navigate = useNavigate()
	const [authOpen, setAuthOpen] = useState(false)
	const [bookOpen, setBookOpen] = useState(false)

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ec29853f4cfcc07ca7a9ccccf493547b18e981a2
	// Авторизованный админ сразу попадает в панель управления, минуя публичный сайт
	useEffect(() => {
		if (!loading && user?.role === 'admin') navigate('/dashboard', { replace: true })
	}, [loading, user, navigate])
<<<<<<< HEAD
=======
=======
	const containerRef = useRef<HTMLDivElement>(null)
	const glowRef = useRef<HTMLDivElement>(null)
	const brushRef = useRef<SVGPathElement>(null)
	const eyebrowRef = useRef<HTMLParagraphElement>(null)
	const headline1Ref = useRef<HTMLDivElement>(null)
	const headline2Ref = useRef<HTMLDivElement>(null)
	const underlineRef = useRef<SVGPathElement>(null)
	const subRef = useRef<HTMLParagraphElement>(null)
	const ctaRef = useRef<HTMLDivElement>(null)
	const bookBtnRef = useRef<HTMLButtonElement>(null)
	const socialBtnsRef = useRef<HTMLDivElement>(null)
	const tilesRef = useRef<HTMLDivElement>(null)
	const langRef = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			const mm = gsap.matchMedia()

			mm.add('(prefers-reduced-motion: reduce)', () => {
				gsap.set(
					[
						glowRef.current,
						langRef.current,
						eyebrowRef.current,
						headline1Ref.current,
						headline2Ref.current,
						subRef.current,
						ctaRef.current,
					],
					{ clearProps: 'all', opacity: 1 },
				)
				if (brushRef.current) gsap.set(brushRef.current, { clearProps: 'all' })
				if (underlineRef.current)
					gsap.set(underlineRef.current, { clearProps: 'all' })
				const tiles = tilesRef.current?.querySelectorAll('.tile-item')
				if (tiles?.length) gsap.set(tiles, { clearProps: 'all', opacity: 1 })
			})

			mm.add('(prefers-reduced-motion: no-preference)', () => {
				const master = gsap.timeline({ defaults: { ease: 'power3.out' } })

				master.set({}, {}, 0.3)
				master.fromTo(
					glowRef.current,
					{ opacity: 0 },
					{ opacity: 1, duration: 1.4, ease: 'power2.out' },
				)

				if (brushRef.current) {
					const len = brushRef.current.getTotalLength()
					gsap.set(brushRef.current, {
						strokeDasharray: len,
						strokeDashoffset: len,
					})
					master.to(
						brushRef.current,
						{ strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
						'-=0.8',
					)
				}

				master.from(
					langRef.current,
					{
						opacity: 0,
						scale: 0.6,
						y: -14,
						duration: 0.55,
						ease: 'back.out(2)',
					},
					'-=0.3',
				)

				master.fromTo(
					eyebrowRef.current,
					{ clipPath: 'inset(0 100% 0 0)', opacity: 0 },
					{
						clipPath: 'inset(0 0% 0 0)',
						opacity: 1,
						duration: 0.9,
						ease: 'power3.inOut',
					},
					'-=0.35',
				)

				master.fromTo(
					headline1Ref.current,
					{ clipPath: 'inset(0 0 100% 0)', yPercent: 18, opacity: 0 },
					{
						clipPath: 'inset(0 0 0% 0)',
						yPercent: 0,
						opacity: 1,
						duration: 0.85,
						ease: 'power4.out',
					},
					'-=0.25',
				)
				master.fromTo(
					headline2Ref.current,
					{ clipPath: 'inset(0 0 100% 0)', yPercent: 18, opacity: 0 },
					{
						clipPath: 'inset(0 0 0% 0)',
						yPercent: 0,
						opacity: 1,
						duration: 0.85,
						ease: 'power4.out',
					},
					'-=0.55',
				)

				if (underlineRef.current) {
					const len = underlineRef.current.getTotalLength()
					gsap.set(underlineRef.current, {
						strokeDasharray: len,
						strokeDashoffset: len,
					})
					master.to(
						underlineRef.current,
						{ strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' },
						'-=0.3',
					)
				}

				master.from(
					subRef.current,
					{ y: 16, opacity: 0, duration: 0.5 },
					'-=0.15',
				)

				master.from(ctaRef.current, { opacity: 0, duration: 0.3 }, '-=0.1')
				if (bookBtnRef.current) {
					master.fromTo(
						bookBtnRef.current,
						{ scale: 0.4, borderRadius: '50%', opacity: 0 },
						{
							scale: 1,
							borderRadius: '16px',
							opacity: 1,
							duration: 0.7,
							ease: 'elastic.out(1, 0.65)',
						},
						'<',
					)
				}
				const socials = socialBtnsRef.current?.querySelectorAll('.social-drop')
				if (socials?.length) {
					gsap.set(socials, { clearProps: 'all' })
				}

				const tiles = tilesRef.current?.querySelectorAll('.tile-item')
				if (tiles?.length) {
					master.fromTo(
						tiles,
						{ clipPath: 'circle(0% at 50% 50%)', opacity: 0, scale: 0.85 },
						{
							clipPath: 'circle(75% at 50% 50%)',
							opacity: 1,
							scale: 1,
							duration: 0.6,
							stagger: { amount: 0.4, from: 'start' },
							ease: 'power2.out',
						},
						'-=0.15',
					)
				}

				return () => {
					master.kill()
				}
			})

			return () => mm.revert()
		},
		{ scope: containerRef },
	)
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
>>>>>>> ec29853f4cfcc07ca7a9ccccf493547b18e981a2

	const handleBook = () => (user ? setBookOpen(true) : setAuthOpen(true))

	const TILES = [
		{
			label: t('landing.prices'),
			action: null,
			href: '/prices',
			external: false,
		},
		{
			label: t('landing.portfolio'),
			action: null,
			href: '/portfolio',
			external: false,
		},
		{
			label: t('landing.review'),
			action: null,
			href: 'https://yandex.ru/maps/org/kerii_nailss/109264447499/?add-review=true',
			external: true,
		},
		{
			label: 'Перейти на полный сайт',
			action: null,
			href: '/home',
			external: false,
		},
	]

	const TILE_ICONS = ['✦', '◈', '★', '↗']

	return (
		<>
			<style>{`
        .lp-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .lp-body    { font-family: 'Jost', system-ui, sans-serif; }
        .lp-headline-clip { display: block; }
        .lp-glossy-text {
          background: linear-gradient(100deg, #F6EEE4 30%, #FFFDF8 42%, #E9C9A0 50%, #F6EEE4 58%, #F6EEE4 100%);
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: lp-gloss-sweep 7s ease-in-out infinite;
        }
        @keyframes lp-gloss-sweep {
          0%   { background-position: 100% 0; }
          50%  { background-position: 0% 0; }
          100% { background-position: 100% 0; }
        }
        .lp-veil {
          background:
            radial-gradient(60% 50% at 30% 15%, rgba(233,201,160,0.16), transparent 60%),
            radial-gradient(55% 45% at 80% 85%, rgba(217,175,134,0.14), transparent 65%);
          mix-blend-mode: soft-light;
          animation: lp-veil-shift 14s ease-in-out infinite;
        }
        @keyframes lp-veil-shift {
          0%, 100% { opacity: 0.65; transform: translate3d(0,0,0) scale(1); }
          50%      { opacity: 1;    transform: translate3d(1%, -1%, 0) scale(1.04); }
        }
        .lp-book-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
        }
        .lp-book-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.55) 45%, transparent 70%);
          transform: translateX(-120%);
          animation: lp-sheen 3.2s ease-in-out infinite;
        }
        @keyframes lp-sheen {
          0%   { transform: translateX(-130%); }
          55%  { transform: translateX(130%); }
          100% { transform: translateX(130%); }
        }
        .lp-book-btn:hover  { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 34px rgba(185,138,78,0.55), inset 0 1px 0 rgba(255,255,255,0.35); }
        .lp-book-btn:active { transform: scale(0.95) scaleY(0.92); }
        .lp-social-btn {
          position: relative;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }
        .lp-social-btn:active { transform: scale(0.9); }

        .lp-social-btn--whatsapp:hover {
          transform: translateY(-3px) scale(1.08);
          background: rgba(37,211,102,0.16) !important;
          border-color: rgba(37,211,102,0.45) !important;
          box-shadow: 0 10px 28px rgba(37,211,102,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .lp-social-btn--telegram:hover {
          transform: translateY(-3px) scale(1.08);
          background: rgba(38,165,228,0.16) !important;
          border-color: rgba(38,165,228,0.45) !important;
          box-shadow: 0 10px 28px rgba(38,165,228,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .tile-item {
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .tile-item:hover  { transform: translateY(-5px) scale(1.035) rotate(-0.4deg); box-shadow: 0 22px 46px rgba(0,0,0,0.5), 0 0 0 1px rgba(233,201,160,0.35) inset; border-color: rgba(233,201,160,0.5) !important; }
        .tile-item:active { transform: scale(0.96); }
        .tile-item .tile-glow { opacity: 0; transition: opacity 0.25s ease; }
        .tile-item:hover .tile-glow { opacity: 1; }
        @keyframes lp-ring {
          0%   { transform: scale(1);    opacity: 0.45; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        .lp-ring-pulse { animation: lp-ring 2.6s ease-out infinite; }
        .lp-lang-shell {
          background: rgba(23,17,14,0.4);
          border: 1px solid rgba(233,201,160,0.25);
          backdrop-filter: blur(14px);
          border-radius: 999px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        /* Guaranteed-visible entrance for WhatsApp / Telegram / full-site link.
           Pure CSS, independent of the GSAP master timeline — cannot get
           stuck invisible even if something upstream in the JS fails. */
        @keyframes lp-cta-reveal {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .lp-cta-fade {
          opacity: 0;
          animation: lp-cta-reveal 0.6s cubic-bezier(.22,1,.36,1) forwards;
          animation-delay: 1.6s;
        }

        @media (prefers-reduced-motion: reduce) {
          .lacquer-drop, .glitter, .lp-veil        { display: none; animation: none; }
          .lp-book-btn::before, .lp-ring-pulse     { display: none; animation: none; }
          .lp-glossy-text                          { animation: none; background-position: 0 0; }
          .lp-cta-fade                             { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

			<div ref={containerRef} className='relative min-h-screen w-full'>
				<video
					className='absolute inset-0 w-full h-full object-cover'
					src='/videos/hero.mp4'
					poster={posterImg}
					autoPlay
					muted
					loop
					playsInline
				/>

				<div
					ref={glowRef}
					className='absolute inset-0 overflow-hidden'
					style={{ zIndex: 1, pointerEvents: 'none' }}
				>
					<div
						className='absolute inset-0'
						style={{
							background:
								'linear-gradient(180deg, rgba(15,10,8,0.74) 0%, rgba(20,14,10,0.5) 40%, rgba(12,8,7,0.8) 100%)',
						}}
					/>
					<div
						className='absolute inset-0'
						style={{
							background:
								'radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(8,5,4,0.55) 100%)',
						}}
					/>
					<div className='absolute inset-0 lp-veil' />
					<GlitterLayer />
					<LacquerDrops count={18} />
				</div>

				<div
					ref={langRef}
					className='absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-10 z-20 lp-lang-shell px-1 py-1'
				>
					<LanguageSwitcher />
				</div>

				<div className='relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-16 sm:px-8 sm:py-20 lg:px-16'>
					<div className='w-full max-w-sm sm:max-w-xl lg:max-w-6xl'>
						<div className='flex flex-col items-center text-center gap-8 lg:flex-row lg:items-center lg:text-left lg:gap-20'>
							<div className='flex flex-col items-center lg:items-start lg:flex-1 lg:min-w-0'>
								<svg
									width='120'
									height='18'
									viewBox='0 0 120 18'
									className='mb-3 lg:w-[150px]'
									style={{ overflow: 'visible' }}
								>
									<path
										ref={brushRef}
										d='M4,12 C30,2 90,2 116,10'
										fill='none'
										stroke='#B98A4E'
										strokeWidth='1.4'
										strokeLinecap='round'
										opacity='0.85'
									/>
								</svg>

								<p
									ref={eyebrowRef}
									className='lp-body text-[10px] sm:text-xs font-light tracking-[0.4em] uppercase mb-5'
									style={{ color: 'rgba(246,238,228,0.75)' }}
								>
									Маникюрный салон · Санкт‑Петербург
								</p>

								<h1 className='lp-display mb-2' style={{ lineHeight: 1.05 }}>
									<span
										className='lp-headline-clip'
										style={{ overflow: 'hidden' }}
									>
										<div
											ref={headline1Ref}
											className='lp-glossy-text font-light italic'
											style={{
												letterSpacing: '-0.01em',
												fontSize: 'clamp(2.75rem, 3.4rem + 3vw, 6.5rem)',
											}}
										>
											Красота
										</div>
									</span>
									<span
										className='lp-headline-clip relative inline-block'
										style={{ overflow: 'visible' }}
									>
										<div
											ref={headline2Ref}
											className='lp-glossy-text font-light'
											style={{
												letterSpacing: '0.04em',
												fontSize: 'clamp(2.75rem, 3.4rem + 3vw, 6.5rem)',
											}}
										>
											в деталях
										</div>
										<svg
											width='100%'
											height='14'
											viewBox='0 0 220 14'
											preserveAspectRatio='none'
											style={{
												position: 'absolute',
												left: 0,
												bottom: -6,
												overflow: 'visible',
											}}
										>
											<path
												ref={underlineRef}
												d='M6,8 C60,2 160,2 214,7'
												fill='none'
												stroke='#E9C9A0'
												strokeWidth='2.2'
												strokeLinecap='round'
												opacity='0.9'
											/>
										</svg>
									</span>
								</h1>

								<p
									ref={subRef}
									className='lp-body text-sm sm:text-base font-light leading-relaxed mb-0 px-2 lg:px-0 mt-4 max-w-xs lg:max-w-md'
									style={{ color: 'rgba(246,238,228,0.6)' }}
								>
									Премиальный маникюр и педикюр.
									<br />
									Запись онлайн — быстро и удобно.
								</p>
							</div>

							<div className='flex flex-col items-center w-full lg:items-stretch lg:w-[400px] lg:flex-shrink-0'>
								<div
									ref={ctaRef}
									className='flex items-center gap-3 mb-8 w-full'
								>
									<div className='relative flex-1'>
										<div
											className='lp-ring-pulse absolute inset-0 rounded-xl'
											style={{
												border: '1px solid rgba(233,201,160,0.4)',
												borderRadius: '16px',
											}}
										/>
										<button
											ref={bookBtnRef}
											onClick={handleBook}
											className='lp-book-btn relative w-full py-3.5 lg:py-4 rounded-2xl lp-body text-sm lg:text-base font-medium tracking-wide'
											style={{
												background:
													'linear-gradient(135deg, rgba(233,201,160,0.95), rgba(185,138,78,0.9))',
												color: '#2a1a0d',
												boxShadow:
													'0 4px 30px rgba(185,138,78,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
												backdropFilter: 'blur(8px)',
											}}
										>
											Записаться
										</button>
									</div>

									<div ref={socialBtnsRef} className='flex items-center gap-3'>
										<a
											href={SOCIAL_LINKS.whatsapp}
											target='_blank'
											rel='noopener noreferrer'
											className='social-drop lp-social-btn lp-social-btn--whatsapp lp-cta-fade w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full'
											style={{
												background: 'rgba(255,255,255,0.06)',
												border: '1px solid rgba(246,238,228,0.18)',
												backdropFilter: 'blur(10px)',
												boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
											}}
										>
											<FaWhatsapp
												style={{ color: '#25D366', fontSize: '19px' }}
											/>
										</a>

										<a
											href={SOCIAL_LINKS.telegram}
											target='_blank'
											rel='noopener noreferrer'
											className='social-drop lp-social-btn lp-social-btn--telegram lp-cta-fade w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full'
											style={{
												background: 'rgba(255,255,255,0.06)',
												border: '1px solid rgba(246,238,228,0.18)',
												backdropFilter: 'blur(10px)',
												boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
												animationDelay: '1.75s',
											}}
										>
											<FaTelegram
												style={{ color: '#26A5E4', fontSize: '19px' }}
											/>
										</a>
									</div>
								</div>

								<div
									ref={tilesRef}
									className='grid grid-cols-2 gap-2 lg:gap-3 w-full mb-8'
								>
									{TILES.map((tile, i) => {
										const inner = (
											<div
												className='tile-item relative rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer overflow-hidden'
												style={{
													minHeight: '86px',
													padding: '14px 10px',
													background: 'rgba(23,17,14,0.55)',
													border: '1px solid rgba(246,238,228,0.12)',
													backdropFilter: 'blur(16px)',
												}}
											>
												<div
													className='tile-glow absolute inset-0 pointer-events-none'
													style={{
														background:
															'radial-gradient(circle at 50% 30%, rgba(233,201,160,0.22), transparent 70%)',
													}}
												/>
												<span
													className='text-lg relative'
													style={{
														filter:
															'drop-shadow(0 0 6px rgba(233,201,160,0.55))',
													}}
												>
													{TILE_ICONS[i]}
												</span>
												<span
													className='lp-body text-xs font-light text-center leading-tight relative'
													style={{
														color: 'rgba(246,238,228,0.85)',
														letterSpacing: '0.02em',
													}}
												>
													{tile.label}
												</span>
											</div>
										)

										if (tile.action)
											return (
												<button
													key={tile.label}
													onClick={tile.action}
													className='block'
												>
													{inner}
												</button>
											)
										if (tile.external)
											return (
												<a
													key={tile.label}
													href={tile.href!}
													target='_blank'
													rel='noopener noreferrer'
												>
													{inner}
												</a>
											)
										return (
											<Link key={tile.label} to={tile.href!}>
												{inner}
											</Link>
										)
									})}
								</div>
							</div>
						</div>
					</div>
				</div>

				{authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
				{bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
			</div>
		</>
	)
}
