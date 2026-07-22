import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '../../hooks/useAuth'
import { useBanners, type Banner } from '../../hooks/useBanners'
import { apiFetch } from '../../utils/api'
import { compressImage } from '../../utils/compressImage'

type FormState = {
	id?: string
	text: string
	imageData: string | null
	linkUrl: string
	startDate: string // YYYY-MM-DD, для <input type="date">
	endDate: string
}

function todayStr() {
	return new Date().toISOString().slice(0, 10)
}
function inTwoWeeksStr() {
	const d = new Date()
	d.setDate(d.getDate() + 14)
	return d.toISOString().slice(0, 10)
}

const EMPTY_FORM: FormState = {
	text: '',
	imageData: null,
	linkUrl: '',
	startDate: todayStr(),
	endDate: inTwoWeeksStr(),
}

function status(b: Banner): { label: string; cls: string } {
	const now = new Date()
	const start = new Date(b.startDate)
	const end = new Date(b.endDate)
	if (now < start) return { label: 'Запланирован', cls: 'bg-blue-500/15 text-blue-300' }
	if (now > end) return { label: 'Завершён', cls: 'bg-gray-800 text-gray-500' }
	return { label: 'Активен', cls: 'bg-green-500/15 text-green-300' }
}

function fmtDate(iso: string) {
	return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function BannerModal({
	initial,
	onClose,
	onSaved,
}: {
	initial: FormState
	onClose: () => void
	onSaved: (b: Banner) => void
}) {
	const { token } = useAuth()
	const [form, setForm] = useState<FormState>(initial)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const isEdit = Boolean(form.id)

	async function handleFile(file: File | undefined) {
		if (!file) return
		try {
			const imageData = await compressImage(file, { maxDimension: 1000 })
			setForm(f => ({ ...f, imageData }))
		} catch (e: any) {
			setError(e.message || 'Не удалось обработать изображение')
		}
	}

	async function handleSave() {
		if (!form.text.trim() && !form.imageData) return setError('Укажите текст баннера или загрузите картинку')
		if (!form.startDate || !form.endDate) return setError('Укажите даты показа')
		if (form.endDate < form.startDate) return setError('Дата окончания раньше даты начала')

		setSaving(true)
		setError('')
		try {
			const res = await apiFetch(isEdit ? `/api/admin/banners/${form.id}` : '/api/admin/banners', {
				method: isEdit ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					text: form.text.trim(),
					imageData: form.imageData,
					linkUrl: form.linkUrl.trim(),
					startDate: form.startDate,
					endDate: form.endDate,
				}),
			})
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data.error || 'Не удалось сохранить баннер')
			}
			const saved = await res.json()
			onSaved(saved)
		} catch (e: any) {
			setError(e.message || 'Ошибка сохранения')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div className='absolute inset-0 bg-black/70' onClick={onClose} />
			<div className='relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-6 max-h-[90vh] overflow-y-auto'>
				<h3 className='font-semibold text-gray-100 text-lg mb-4'>
					{isEdit ? 'Изменить баннер' : 'Новый баннер'}
				</h3>

				<div className='flex flex-col gap-3'>
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Картинка (необязательно)</label>
						{form.imageData ? (
							<div className='relative w-24 h-32 rounded-xl overflow-hidden mb-2'>
								<img src={form.imageData} alt='' className='w-full h-full object-cover' />
								<button
									onClick={() => setForm(f => ({ ...f, imageData: null }))}
									className='absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80'
								>
									✕
								</button>
							</div>
						) : (
							<button
								onClick={() => fileInputRef.current?.click()}
								className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl font-medium transition-colors'
							>
								Загрузить фото
							</button>
						)}
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							className='hidden'
							onChange={e => handleFile(e.target.files?.[0])}
						/>
					</div>

					<div>
						<label className='text-xs text-gray-400 block mb-1'>
							Текст{form.imageData ? ' (необязательно — подпись поверх фото)' : ''}
						</label>
						<textarea
							value={form.text}
							onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
							rows={2}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-pink-400'
							placeholder='Например: Скидка 15% до 31 июля'
						/>
					</div>

					<div>
						<label className='text-xs text-gray-400 block mb-1'>Ссылка при клике (необязательно)</label>
						<input
							value={form.linkUrl}
							onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							placeholder='https://...'
						/>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='text-xs text-gray-400 block mb-1'>Начало показа</label>
							<input
								type='date'
								value={form.startDate}
								onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							/>
						</div>
						<div>
							<label className='text-xs text-gray-400 block mb-1'>Конец показа</label>
							<input
								type='date'
								value={form.endDate}
								onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							/>
						</div>
					</div>

					{error && <p className='text-red-400 text-xs'>{error}</p>}

					<div className='flex gap-2 mt-2'>
						<button
							onClick={onClose}
							className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors'
						>
							Отмена
						</button>
						<button
							onClick={handleSave}
							disabled={saving}
							className='flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white transition-colors'
						>
							{saving ? 'Сохранение…' : 'Сохранить'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function BannersTab() {
	const { token } = useAuth()
	const { reload: reloadPublic } = useBanners()
	const [list, setList] = useState<Banner[]>([])
	const [loading, setLoading] = useState(true)
	const [modal, setModal] = useState<FormState | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
	const rootRef = useRef<HTMLDivElement>(null)

	async function loadList() {
		setLoading(true)
		try {
			const res = await apiFetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } })
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
			gsap.from('.banner-row', { opacity: 0, y: 10, duration: 0.3, stagger: 0.05, ease: 'power2.out' })
		},
		{ scope: rootRef, dependencies: [loading] },
	)

	async function afterChange() {
		await Promise.all([loadList(), reloadPublic()])
	}

	async function handleDelete() {
		if (!deleteTarget) return
		await apiFetch(`/api/admin/banners/${deleteTarget.id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		setDeleteTarget(null)
		await afterChange()
	}

	return (
		<div ref={rootRef}>
			<div className='flex items-center justify-between mb-2 flex-wrap gap-3'>
				<h2 className='text-lg font-semibold text-gray-100'>Баннеры</h2>
				<button
					onClick={() => setModal(EMPTY_FORM)}
					className='px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-xl font-medium transition-colors'
				>
					+ Создать баннер
				</button>
			</div>
			<p className='text-xs text-gray-500 mb-5'>
				Показываются по бокам сайта на широких экранах в указанный период. Если фото нет — показывается
				текст, оформленный как карточка-акция; при указанной ссылке баннер кликабелен.
			</p>

			{loading ? (
				<div className='flex items-center justify-center py-16'>
					<div className='w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin' />
				</div>
			) : list.length === 0 ? (
				<div className='text-center py-12 text-gray-500'>Пока нет баннеров</div>
			) : (
				<div className='flex flex-col gap-2.5'>
					{list.map(b => {
						const st = status(b)
						return (
							<div
								key={b.id}
								className='banner-row bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 flex-wrap'
							>
								{b.imageData ? (
									<img src={b.imageData} alt='' className='w-12 h-16 rounded-lg object-cover shrink-0' />
								) : (
									<div className='w-12 h-16 rounded-lg bg-gray-800 flex items-center justify-center text-gray-600 text-lg shrink-0'>
										Aa
									</div>
								)}

								<div className='flex-1 min-w-[180px]'>
									<div className='flex items-center gap-2 flex-wrap mb-1'>
										<span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
										{b.linkUrl && (
											<span className='text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-medium'>
												🔗 ссылка
											</span>
										)}
									</div>
									<p className='text-sm text-gray-200 truncate' title={b.text}>
										{b.text || <span className='text-gray-500 italic'>без текста (только фото)</span>}
									</p>
									<p className='text-xs text-gray-500 mt-0.5'>
										{fmtDate(b.startDate)} — {fmtDate(b.endDate)}
									</p>
								</div>

								<div className='flex gap-2 shrink-0'>
									<button
										onClick={() =>
											setModal({
												id: b.id,
												text: b.text,
												imageData: b.imageData,
												linkUrl: b.linkUrl,
												startDate: b.startDate.slice(0, 10),
												endDate: b.endDate.slice(0, 10),
											})
										}
										className='px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs rounded-lg font-medium transition-colors'
									>
										Изменить
									</button>
									<button
										onClick={() => setDeleteTarget(b)}
										className='px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs rounded-lg font-medium transition-colors'
									>
										Удалить
									</button>
								</div>
							</div>
						)
					})}
				</div>
			)}

			{modal && (
				<BannerModal
					initial={modal}
					onClose={() => setModal(null)}
					onSaved={async () => {
						setModal(null)
						await afterChange()
					}}
				/>
			)}

			{deleteTarget && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/70' onClick={() => setDeleteTarget(null)} />
					<div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-6'>
						<h3 className='font-semibold text-gray-100 mb-2'>Удалить баннер?</h3>
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
