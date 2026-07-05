import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from 'react'
import { useAuth } from './useAuth'
import { apiFetch } from '../utils/api'

export interface Appointment {
	id: string
	userName: string
	userEmail: string
	userPhone: string
	service: string
	services?: string[]
	date: string
	time: string
	comment: string
	status: string
	duration?: number
	createdAt: string
}

export interface Stats {
	total: number
	pending: number
	confirmed: number
	completed: number
	cancelled: number
	totalClients: number
}

interface AdminDataContextType {
	appointments: Appointment[]
	stats: Stats | null
	loading: boolean
	reload: () => Promise<void>
	updateStatus: (id: string, status: string) => Promise<void>
}

const AdminDataContext = createContext<AdminDataContextType | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
	const { token } = useAuth()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [stats, setStats] = useState<Stats | null>(null)
	const [loading, setLoading] = useState(true)

	const reload = useCallback(async () => {
		if (!token) return
		setLoading(true)
		try {
			const [appts, st] = await Promise.all([
				apiFetch('/api/admin/appointments', {
					headers: { Authorization: `Bearer ${token}` },
				}).then(r => r.json()),
				apiFetch('/api/admin/stats', {
					headers: { Authorization: `Bearer ${token}` },
				}).then(r => r.json()),
			])
			setAppointments(appts)
			setStats(st)
		} finally {
			setLoading(false)
		}
	}, [token])

	const updateStatus = useCallback(
		async (id: string, status: string) => {
			await apiFetch(`/api/admin/appointments/${id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status }),
			})
			setAppointments(prev =>
				prev.map(a => (a.id === id ? { ...a, status } : a)),
			)
			await reload()
		},
		[token, reload],
	)

	return (
		<AdminDataContext.Provider
			value={{ appointments, stats, loading, reload, updateStatus }}
		>
			{children}
		</AdminDataContext.Provider>
	)
}

export function useAdminData() {
	const ctx = useContext(AdminDataContext)
	if (!ctx)
		throw new Error('useAdminData must be used inside AdminDataProvider')
	return ctx
}
