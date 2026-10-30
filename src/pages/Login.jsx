import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
    } catch {
      setError('Wrong username or password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl">📒</div>
          <h1 className="mt-2 text-xl font-bold">Digital Journal</h1>
          <p className="text-sm text-slate-500">Teacher login</p>
        </div>
        <div>
          <label className="label">Username</label>
          <input className="input" autoFocus required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
