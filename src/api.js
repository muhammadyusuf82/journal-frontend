const BASE = import.meta.env.VITE_API_URL || '/api'

export function getToken() {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

export function setToken(t) {
  try {
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
  } catch {
    /* storage unavailable */
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Token ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (res.status === 401 && token) {
    setToken(null)
    window.location.href = '/login'
    throw new Error('Session expired')
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    let msg = res.statusText
    if (data?.detail) msg = data.detail
    else if (data) msg = Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join('; ')
    throw new Error(msg)
  }
  return data
}
