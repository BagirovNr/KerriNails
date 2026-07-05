import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '../../hooks/useAuth'
import { AdminDataProvider, useAdminData } from '../../hooks/useAdminData'

const NAV_ITEMS = [
	{ to: '/dashboard', end: true, label: 'Записи', icon: '📋' },
	{ to: '/dashboard/calendar', end: false, label: 'Календарь', icon: '📅' },
	{ to: '/dashboard/schedule', end: false, label: 'Расписание', icon: '🗂' },
	{ to: '/dashboard/stats', end: false, label: 'Статистика', icon: '📊' },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
	const { logout, user } = useAuth()
	const navigate = useNavigate()
	const navRef = useRef<HTMLDivElement>(null)

	useGSAP(
		() => {
			gsap.from('.admin-nav-item', {
				opacity: 0,
				x: -12,
				duration: 0.4,
				stagger: 0.06,
				ease: 'power2.out',
			})
		},
		{ scope: navRef },
	)

	return (
		<div ref={navRef} className='flex flex-col h-full'>
			<div className='px-5 py-6'>
				<p
					className='text-xl font-bold'
					style={{ fontFamily: 'Georgia, serif' }}
				>
					<span className='text-gray-100'>Kerri</span>
					<span className='text-pink-400'> Nails</span>
				</p>
				<span className='inline-block mt-1 px-2.5 py-0.5 bg-purple-500/15 text-purple-300 rounded-full text-xs font-semibold'>
					Панель администратора
				</span>
			</div>

			<nav className='flex-1 px-3 flex flex-col gap-1'>
				{NAV_ITEMS.map(item => (
					<NavLink
						key={item.to}
						to={item.to}
						end={item.end}
						onClick={onNavigate}
						className={({ isActive }) =>
							`admin-nav-item px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${
								isActive
									? 'bg-pink-500/10 text-pink-400'
									: 'text-gray-300 hover:bg-gray-800/60 hover:text-gray-100'
							}`
						}
					>
						<span>{item.icon}</span>
						{item.label}
					</NavLink>
				))}
			</nav>

			<div className='px-3 py-5 border-t border-gray-800 flex flex-col gap-1'>
				<p className='px-3 text-xs text-gray-500 truncate'>{user?.name}</p>
				<button
					onClick={() => {
						logout()
						navigate('/')
						onNavigate?.()
					}}
					className='px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left'
				>
					Выйти
				</button>
			</div>
		</div>
	)
}

function DashboardShell() {
	const { user, loading: authLoading } = useAuth()
	const { loading: dataLoading, reload } = useAdminData()
	const navigate = useNavigate()
	const location = useLocation()
	const [menuOpen, setMenuOpen] = useState(false)
	const contentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (authLoading) return
		if (!user || user.role !== 'admin') {
			navigate('/home')
			return
		}
		reload()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authLoading, user])

	useGSAP(
		() => {
			if (authLoading || dataLoading) return
			gsap.fromTo(
				contentRef.current,
				{ opacity: 0, y: 10 },
				{ opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
			)
		},
		{
			scope: contentRef,
			dependencies: [location.pathname, authLoading, dataLoading],
		},
	)

	const currentLabel = NAV_ITEMS.find(i =>
		i.end ? location.pathname === i.to : location.pathname.startsWith(i.to),
	)?.label

	return (
		<div className='h-screen flex bg-[#0b0e14] overflow-hidden'>
			{/* Sidebar — desktop */}
			<aside className='hidden md:flex md:w-60 shrink-0 border-r border-gray-800 bg-gray-900'>
				<NavContent />
			</aside>

			{/* Mobile top bar */}
			<div className='flex-1 flex flex-col min-w-0'>
				<div className='md:hidden flex items-center justify-between px-4 h-14 border-b border-gray-800 bg-gray-900 shrink-0'>
					<button
						onClick={() => setMenuOpen(true)}
						className='p-2 -ml-2 rounded-lg hover:bg-gray-800'
						aria-label='Меню'
					>
						<svg
							viewBox='0 0 24 24'
							className='w-5 h-5 fill-current text-gray-200'
						>
							<path d='M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z' />
						</svg>
					</button>
					<span className='font-semibold text-gray-100'>{currentLabel}</span>
					<span className='w-9' />
				</div>

				{/* Mobile slide-over menu */}
				{menuOpen && (
					<div className='fixed inset-0 z-50 md:hidden'>
						<div
							className='absolute inset-0 bg-black/70'
							onClick={() => setMenuOpen(false)}
						/>
						<div className='absolute left-0 top-0 bottom-0 w-64 bg-gray-900 shadow-2xl shadow-black/40'>
							<NavContent onNavigate={() => setMenuOpen(false)} />
						</div>
					</div>
				)}

				{/* Content — scrollable, so nothing gets clipped on small screens */}
				<main className='flex-1 overflow-y-auto overscroll-contain'>
					<div
						ref={contentRef}
						className='px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto'
					>
						{authLoading || dataLoading ? (
							<div className='flex items-center justify-center py-20'>
								<div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
							</div>
						) : (
							<Outlet />
						)}
					</div>
				</main>
			</div>
		</div>
	)
}

export default function AdminLayout() {
	return (
		<AdminDataProvider>
			<DashboardShell />
		</AdminDataProvider>
	)
}
