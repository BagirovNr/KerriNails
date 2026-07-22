import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '../../hooks/useAuth'
import { useServices, type Service } from '../../hooks/useServices'
import { apiFetch } from '../../utils/api'

const CATS = ['manicure', 'pedicure', 'design', 'extension', 'care']
const CAT_LABELS: Record<string, string> = {
	manicure: 'Маникюр',
	pedicure: 'Педикюр',
	design: 'Дизайн',
	extension: 'Наращивание',
	care: 'Уход',
}

type FormState = {
	id?: string
	name: string
	category: string
	price: string
	description: string
	active: boolean
}

const EMPTY_FORM: FormState = { name: '', category: 'manicure', price: '', description: '', active: true }

function ServiceModal({
	initial,
	onClose,
	onSaved,
}: {
	initial: FormState
	onClose: () => void
	onSaved: (s: Service) => void
}) {
	const { token } = useAuth()
	const [form, setForm] = useState<FormState>(initial)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const isEdit = Boolean(form.id)

	async function handleSave() {
		if (!form.name.trim()) return setError('Укажите название')
		const priceNum = Number(form.price)
		if (!Number.isFinite(priceNum) || priceNum < 0) return setError('Укажите корректную цену')

		setSaving(true)
		setError('')
		try {
			const res = await apiFetch(isEdit ? `/api/admin/services/${form.id}` : '/api/admin/services', {
				method: isEdit ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					name: form.name.trim(),
					category: form.category,
					price: priceNum,
					description: form.description,
					active: form.active,
				}),
			})
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data.error || 'Не удалось сохранить услугу')
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
			<div className='relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-6'>
				<h3 className='font-semibold text-gray-100 text-lg mb-4'>
					{isEdit ? 'Изменить услугу' : 'Новая услуга'}
				</h3>

				<div className='flex flex-col gap-3'>
					<div>
						<label className='text-xs text-gray-400 block mb-1'>Название</label>
						<input
							value={form.name}
							onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							placeholder='Например, Классический маникюр'
						/>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='text-xs text-gray-400 block mb-1'>Категория</label>
							<select
								value={form.category}
								onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
							>
								{CATS.map(c => (
									<option key={c} value={c}>
										{CAT_LABELS[c]}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='text-xs text-gray-400 block mb-1'>Цена, ₽</label>
							<input
								type='number'
								min={0}
								value={form.price}
								onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
								className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
								placeholder='1500'
							/>
						</div>
					</div>

					<div>
						<label className='text-xs text-gray-400 block mb-1'>Описание</label>
						<textarea
							value={form.description}
							onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
							rows={2}
							className='w-full border border-gray-700 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-pink-400'
							placeholder='Короткое описание для сайта'
						/>
					</div>

					<label className='flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none'>
						<input
							type='checkbox'
							checked={form.active}
							onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
							className='w-4 h-4 accent-pink-500'
						/>
						Показывать на сайте
					</label>

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

export default function ServicesTab() {
	const { token } = useAuth()
	const { reload: reloadPublicServices } = useServices()
	const [list, setList] = useState<Service[]>([])
	const [loading, setLoading] = useState(true)
	const [cat, setCat] = useState('all')
	const [modal, setModal] = useState<FormState | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
	const rootRef = useRef<HTMLDivElement>(null)

	async function loadAdminList() {
		setLoading(true)
		try {
			const res = await apiFetch('/api/admin/services', { headers: { Authorization: `Bearer ${token}` } })
			const data = await res.json()
			setList(Array.isArray(data) ? data : [])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (token) loadAdminList()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token])

	useGSAP(
		() => {
			if (loading) return
			gsap.from('.service-row', { opacity: 0, y: 10, duration: 0.3, stagger: 0.04, ease: 'power2.out' })
		},
		{ scope: rootRef, dependencies: [loading, cat] },
	)

	async function afterChange() {
		await Promise.all([loadAdminList(), reloadPublicServices()])
	}

	async function handleDelete() {
		if (!deleteTarget) return
		await apiFetch(`/api/admin/services/${deleteTarget.id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		setDeleteTarget(null)
		await afterChange()
	}

	async function toggleActive(s: Service) {
		await apiFetch(`/api/admin/services/${s.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ active: !s.active }),
		})
		await afterChange()
	}

	const filtered = cat === 'all' ? list : list.filter(s => s.category === cat)

	return (
		<div ref={rootRef}>
			<div className='flex items-center justify-between mb-5 flex-wrap gap-3'>
				<h2 className='text-lg font-semibold text-gray-100'>Услуги и цены</h2>
				<button
					onClick={() => setModal(EMPTY_FORM)}
					className='px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-xl font-medium transition-colors'
				>
					+ Добавить услугу
				</button>
			</div>

			<p className='text-xs text-gray-500 mb-4'>
				Изменения цены и описания сразу видны на публичном сайте — обновлять код или деплоить ничего не нужно.
			</p>

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
				<div className='text-center py-12 text-gray-500'>Нет услуг в этой категории</div>
			) : (
				<div className='flex flex-col gap-2.5'>
					{filtered.map(s => (
						<div
							key={s.id}
							className={`service-row bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 flex-wrap ${
								!s.active ? 'opacity-50' : ''
							}`}
						>
							<div className='flex-1 min-w-[160px]'>
								<div className='flex items-center gap-2 flex-wrap'>
									<p className='font-medium text-gray-100'>{s.name}</p>
									<span className='text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-medium'>
										{CAT_LABELS[s.category] || s.category}
									</span>
									{!s.active && (
										<span className='text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 font-medium'>
											Скрыта
										</span>
									)}
								</div>
								{s.description && <p className='text-xs text-gray-500 mt-0.5'>{s.description}</p>}
							</div>

							<span className='font-bold text-pink-400 text-lg shrink-0'>{s.price} ₽</span>

							<div className='flex gap-2 shrink-0'>
								<button
									onClick={() => toggleActive(s)}
									className='px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg font-medium transition-colors'
								>
									{s.active ? 'Скрыть' : 'Показать'}
								</button>
								<button
									onClick={() =>
										setModal({
											id: s.id,
											name: s.name,
											category: s.category,
											price: String(s.price),
											description: s.description,
											active: s.active,
										})
									}
									className='px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs rounded-lg font-medium transition-colors'
								>
									Изменить
								</button>
								<button
									onClick={() => setDeleteTarget(s)}
									className='px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs rounded-lg font-medium transition-colors'
								>
									Удалить
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{modal && (
				<ServiceModal
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
						<h3 className='font-semibold text-gray-100 mb-2'>Удалить услугу?</h3>
						<p className='text-sm text-gray-400 mb-5'>
							«{deleteTarget.name}» будет удалена безвозвратно. Если нужно просто временно убрать её с
							сайта — используйте «Скрыть».
						</p>
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
