import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiFetch } from '../utils/api'

export interface Banner {
	id: string
	text: string
	imageData: string | null
	linkUrl: string
	startDate: string
	endDate: string
}

interface BannersContextType {
	banners: Banner[]
	loading: boolean
	/** Перезапросить баннеры у сервера — вызывается после любого изменения в
	 * /dashboard/banners, чтобы сайт сразу увидел новый/изменённый баннер. */
	reload: () => Promise<void>
}

const BannersContext = createContext<BannersContextType | null>(null)

export function BannersProvider({ children }: { children: ReactNode }) {
	const [banners, setBanners] = useState<Banner[]>([])
	const [loading, setLoading] = useState(true)

	const reload = useCallback(async () => {
		try {
			const res = await apiFetch('/api/banners')
			const data = await res.json()
			setBanners(Array.isArray(data) ? data : [])
		} catch {
			// Публичный сайт не должен падать из-за временной недоступности API
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		reload()
	}, [reload])

	return <BannersContext.Provider value={{ banners, loading, reload }}>{children}</BannersContext.Provider>
}

export function useBanners() {
	const ctx = useContext(BannersContext)
	if (!ctx) throw new Error('useBanners must be used inside BannersProvider')
	return ctx
}
