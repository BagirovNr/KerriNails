import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio, type PortfolioItem } from '../../hooks/usePortfolio'
import { apiFetch } from '../../utils/api'
import { compressImage } from '../../utils/compressImage'

const CATS = ['manicure', 'pedicure', 'design', 'extension']
const CAT_LABELS: Record<string, string> = {
	manicure: 'Маникюр',
	pedicure: 'Педикюр',
	design: 'Дизайн',
	extension: 'Наращивание',
}

export default function PortfolioTab() {
	const { token } = useAuth()
	const { reload: reloadPublic } = usePortfolio()
	const [list, setList] = useState<PortfolioItem[]>([])
	const [loading, setLoading] = useState(true)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState('')
	const [cat, setCat] = useState('all')
	const [editTarget, setEditTarget] = useState<PortfolioItem | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null)
	const [uploadCategory, setUploadCategory] = useState('manicure')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const rootRef = useRef<HTMLDivElement>(null)

	async function loadList() {
		setLoading(true)
		try {
			const res = await apiFetch('/api/admin/portfolio', { headers: { Authorization: `Bearer ${token}` } })
			const data = await res.json()
			setList(Array.isArray(data) ? data : [])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (token) loadList()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token])

	useGSAP(
		() => {
			if (loading) return
			gsap.from('.portfolio-card', { opacity: 0, y: 12, duration: 0.35, stagger: 0.04, ease: 'power2.out' })
		},
		{ scope: rootRef, dependencies: [loading, cat] },
	)

	async function afterChange() {
		await Promise.all([loadList(), reloadPublic()])
	}

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return
		setUploading(true)
		setError('')
		try {
			for (const file of Array.from(files)) {
				if (!file.type.startsWith('image/')) continue
				const imageData = await compressImage(file)
				const res = await apiFetch('/api/admin/portfolio', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
					body: JSON.stringify({ imageData, category: uploadCategory, description: '' }),
				})
				if (!res.ok) {
					const data = await res.json().catch(() => ({}))
					throw new Error(data.error || 'Не удалось загрузить фото')
				}
			}
			await afterChange()
		} catch (e: any) {
			setError(e.message || 'Ошибка загрузки')
		} finally {
			setUploading(false)
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return
		await apiFetch(`/api/admin/portfolio/${deleteTarget.id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		setDeleteTarget(null)
		await afterChange()
	}

	async function saveEdit() {
		if (!editTarget) return
		await apiFetch(`/api/admin/portfolio/${editTarget.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ description: editTarget.description, category: editTarget.category }),
		})
		setEditTarget(null)
		await afterChange()
	}

	async function move(item: PortfolioItem, direction: -1 | 1) {
		const idx = list.findIndex(i => i.id === item.id)
		const swapIdx = idx + direction
		if (swapIdx < 0 || swapIdx >= list.length) return
		const reordered = [...list]
		;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
		setList(reordered) // мгновенный отклик в UI, не дожидаясь ответа сервера

		await apiFetch('/api/admin/portfolio-reorder', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ order: reordered.map(i => i.id) }),
		})
		await reloadPublic()
	}

	const filtered = cat === 'all' ? list : list.filter(i => i.category === cat)

	return (
		<div ref={rootRef}>
			<div className='flex items-center justify-between mb-2 flex-wrap gap-3'>
				<h2 className='text-lg font-semibold text-gray-100'>Портфолио</h2>
			</div>
			<p className='text-xs text-gray-500 mb-4'>
				Новые фото и изменения сразу видны в разделе «Портфолио» на сайте. Порядок можно менять только во
				вкладке «Все» — иначе непонятно, с каким соседним фото происходит обмен местами.
			</p>

			{/* Загрузка */}
			<div className='bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3'>
				<select
					value={uploadCategory}
					onChange={e => setUploadCategory(e.target.value)}
					className='border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
				>
					{CATS.map(c => (
						<option key={c} value={c}>
							{CAT_LABELS[c]}
						</option>
					))}
				</select>
				<button
					onClick={() => fileInputRef.current?.click()}
					disabled={uploading}
					className='px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-colors'
				>
					{uploading ? 'Загрузка…' : '+ Загрузить фото'}
				</button>
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					multiple
					className='hidden'
					onChange={e => handleFiles(e.target.files)}
				/>
				<span className='text-xs text-gray-500'>Можно выбрать сразу несколько фото — категория применится ко всем</span>
			</div>
			{error && <p className='text-red-400 text-xs mb-4'>{error}</p>}

			{/* Фильтр по категориям */}
			<div className='flex flex-wrap gap-2 mb-5'>
				{['all', ...CATS].map(c => (
					<button
						key={c}
						onClick={() => setCat(c)}
						className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
							cat === c ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
						}`}
					>
						{c === 'all' ? 'Все' : CAT_LABELS[c]}
					</button>
				))}
			</div>

			{loading ? (
				<div className='flex items-center justify-center py-16'>
					<div className='w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
				</div>
			) : filtered.length === 0 ? (
				<div className='text-center py-12 text-gray-500'>Нет фото в этой категории</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
					{filtered.map(item => {
						const idx = list.findIndex(i => i.id === item.id)
						return (
							<div
								key={item.id}
								className='portfolio-card bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden'
							>
								<div className='aspect-square overflow-hidden bg-gray-800'>
									<img src={item.imageData} alt={item.description} className='w-full h-full object-cover' />
								</div>
								<div className='p-3'>
									<div className='flex items-center gap-1.5 mb-2'>
										<span className='text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-medium'>
											{CAT_LABELS[item.category] || item.category}
										</span>
									</div>
									<p className='text-sm text-gray-200 truncate mb-3' title={item.description}>
										{item.description || <span className='text-gray-500 italic'>без описания</span>}
									</p>
									<div className='flex items-center gap-1.5'>
										<button
											onClick={() => move(item, -1)}
											disabled={cat !== 'all' || idx === 0}
											className='w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 text-xs'
											title={cat !== 'all' ? 'Доступно только во вкладке «Все»' : 'Переместить раньше'}
										>
											↑
										</button>
										<button
											onClick={() => move(item, 1)}
											disabled={cat !== 'all' || idx === list.length - 1}
											className='w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 text-xs'
											title={cat !== 'all' ? 'Доступно только во вкладке «Все»' : 'Переместить позже'}
										>
											↓
										</button>
										<button
											onClick={() => setEditTarget(item)}
											className='flex-1 px-2 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs rounded-lg font-medium transition-colors'
										>
											Изменить
										</button>
										<button
											onClick={() => setDeleteTarget(item)}
											className='px-2 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs rounded-lg font-medium transition-colors'
										>
											✕
										</button>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			)}

			{/* Модалка редактирования описания/категории */}
			{editTarget && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/70' onClick={() => setEditTarget(null)} />
					<div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-6'>
						<h3 className='font-semibold text-gray-100 mb-4'>Изменить фото</h3>
						<div className='aspect-video rounded-xl overflow-hidden mb-4 bg-gray-800'>
							<img src={editTarget.imageData} alt='' className='w-full h-full object-cover' />
						</div>
						<label className='text-xs text-gray-400 block mb-1'>Описание</label>
						<input
							value={editTarget.description}
							onChange={e => setEditTarget(t => (t ? { ...t, description: e.target.value } : t))}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-pink-400'
							placeholder='Например, Французский маникюр'
						/>
						<label className='text-xs text-gray-400 block mb-1'>Категория</label>
						<select
							value={editTarget.category}
							onChange={e => setEditTarget(t => (t ? { ...t, category: e.target.value } : t))}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm mb-5 focus:outline-none focus:border-pink-400'
						>
							{CATS.map(c => (
								<option key={c} value={c}>
									{CAT_LABELS[c]}
								</option>
							))}
						</select>
						<div className='flex gap-2'>
							<button
								onClick={() => setEditTarget(null)}
								className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors'
							>
								Отмена
							</button>
							<button
								onClick={saveEdit}
								className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-pink-500 hover:bg-pink-600 text-white transition-colors'
							>
								Сохранить
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Подтверждение удаления */}
			{deleteTarget && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/70' onClick={() => setDeleteTarget(null)} />
					<div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-6'>
						<h3 className='font-semibold text-gray-100 mb-2'>Удалить фото?</h3>
						<p className='text-sm text-gray-400 mb-5'>Действие необратимо.</p>
						<div className='flex gap-2'>
							<button
								onClick={() => setDeleteTarget(null)}
								className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors'
							>
								Отмена
							</button>
							<button
								onClick={handleDelete}
								className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors'
							>
								Удалить
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
