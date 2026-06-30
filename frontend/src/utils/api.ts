// In development: Vite proxies /api → localhost:3001  (no env var needed)
// In production:  VITE_API_URL = https://your-app.railway.app
const BASE = import.meta.env.VITE_API_URL || ''

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, options)
  return res
}
