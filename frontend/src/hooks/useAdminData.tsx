<<<<<<< HEAD
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
=======
import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from 'react'
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
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
<<<<<<< HEAD
	error: string | null
=======
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
	reload: () => Promise<void>
	updateStatus: (id: string, status: string) => Promise<void>
}

const AdminDataContext = createContext<AdminDataContextType | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
	const { token } = useAuth()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [stats, setStats] = useState<Stats | null>(null)
	const [loading, setLoading] = useState(true)
<<<<<<< HEAD
	const [error, setError] = useState<string | null>(null)

	const reload = useCallback(async () => {
		if (!token) {
			setLoading(false)
			return
		}
		setLoading(true)
		setError(null)
		try {
			const [apptsRes, statsRes] = await Promise.all([
				apiFetch('/api/admin/appointments', { headers: { Authorization: `Bearer ${token}` } }),
				apiFetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
			])
			if (!apptsRes.ok || !statsRes.ok) {
				throw new Error(`Сервер вернул ошибку (записи: ${apptsRes.status}, статистика: ${statsRes.status})`)
			}
			const [appts, st] = await Promise.all([apptsRes.json(), statsRes.json()])
			setAppointments(appts)
			setStats(st)
		} catch (e: any) {
			console.error('[useAdminData] не удалось загрузить данные дашборда:', e)
			setError(e?.message || 'Не удалось загрузить данные')
=======

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
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
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
<<<<<<< HEAD
			setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
=======
			setAppointments(prev =>
				prev.map(a => (a.id === id ? { ...a, status } : a)),
			)
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
			await reload()
		},
		[token, reload],
	)

	return (
<<<<<<< HEAD
		<AdminDataContext.Provider value={{ appointments, stats, loading, error, reload, updateStatus }}>
=======
		<AdminDataContext.Provider
			value={{ appointments, stats, loading, reload, updateStatus }}
		>
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
			{children}
		</AdminDataContext.Provider>
	)
}

export function useAdminData() {
	const ctx = useContext(AdminDataContext)
<<<<<<< HEAD
	if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider')
=======
	if (!ctx)
		throw new Error('useAdminData must be used inside AdminDataProvider')
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
	return ctx
}
