import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiFetch } from '../utils/api'

export interface PortfolioItem {
	id: string
	imageData: string
	description: string
	category: string
	order: number
}

interface PortfolioContextType {
	items: PortfolioItem[]
	loading: boolean
	/** Перезапросить фото у сервера — вызывается после загрузки/редактирования/
	 * удаления/изменения порядка в /dashboard/portfolio, чтобы публичный сайт
	 * сразу увидел изменения. */
	reload: () => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextType | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<PortfolioItem[]>([])
	const [loading, setLoading] = useState(true)

	const reload = useCallback(async () => {
		try {
			const res = await apiFetch('/api/portfolio')
			const data = await res.json()
			setItems(Array.isArray(data) ? data : [])
		} catch {
			// Публичный сайт не должен падать из-за временной недоступности API
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		reload()
	}, [reload])

	return <PortfolioContext.Provider value={{ items, loading, reload }}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
	const ctx = useContext(PortfolioContext)
	if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider')
	return ctx
}
