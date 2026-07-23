import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiFetch } from '../utils/api'

export interface Service {
	id: string
	slug: string
	category: string
	name: string
	price: number
	description: string
	active: boolean
	order: number
}

interface ServicesContextType {
	services: Service[]
	loading: boolean
	/** Перезапросить список услуг у сервера — вызывается после любого изменения
	 * в /dashboard/services, чтобы публичный сайт сразу увидел новые цены. */
	reload: () => Promise<void>
}

const ServicesContext = createContext<ServicesContextType | null>(null)

export function ServicesProvider({ children }: { children: ReactNode }) {
	const [services, setServices] = useState<Service[]>([])
	const [loading, setLoading] = useState(true)

	const reload = useCallback(async () => {
		try {
			const res = await apiFetch('/api/services')
			const data = await res.json()
			setServices(Array.isArray(data) ? data : [])
		} catch {
			// Публичный сайт не должен падать из-за временной недоступности API —
			// список просто останется прежним/пустым до следующей успешной загрузки.
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		reload()
	}, [reload])

	return <ServicesContext.Provider value={{ services, loading, reload }}>{children}</ServicesContext.Provider>
}

export function useServices() {
	const ctx = useContext(ServicesContext)
	if (!ctx) throw new Error('useServices must be used inside ServicesProvider')
	return ctx
}
