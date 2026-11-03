import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { LanguageSwitcher, useI18n } from '../i18n.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const { t } = useI18n()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(false)
    try {
      await login(username, password)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <LanguageSwitcher />
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl">📒</div>
          <h1 className="mt-2 text-xl font-bold">{t('app.title')}</h1>
          <p className="text-sm text-slate-500">{t('login.subtitle')}</p>
        </div>
        <div>
          <label className="label">{t('login.username')}</label>
          <input className="input" autoFocus required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('login.password')}</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{t('login.wrong')}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? t('login.signingIn') : t('login.signIn')}</button>
      </form>
    </div>
  )
}
