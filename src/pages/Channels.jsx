import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Channels() {
  const [channels, setChannels] = useState([])
  const [form, setForm] = useState({ name: '', link: '' })

  const load = () => api('/channels/').then(setChannels)
  useEffect(() => {
    load()
  }, [])

  async function add(e) {
    e.preventDefault()
    await api('/channels/', { method: 'POST', body: form })
    setForm({ name: '', link: '' })
    load()
  }

  async function remove(c) {
    if (!confirm(`Delete channel "${c.name}"?`)) return
    await api(`/channels/${c.id}/`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Channels</h1>
      <p className="text-sm text-slate-500">Channels students should be subscribed to. Tick them on each student's card.</p>
      <form onSubmit={add} className="card flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <label className="label">Name</label>
          <input className="input" required placeholder="Telegram channel" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="label">Link</label>
          <input className="input" placeholder="https://t.me/…" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <button className="btn btn-primary">+ Add</button>
      </form>
      <ul className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
        {channels.length === 0 && <li className="p-4 text-sm text-slate-500">No channels yet.</li>}
        {channels.map((c) => (
          <li key={c.id} className="flex items-center gap-3 p-4">
            <span className="font-medium">{c.name}</span>
            {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="truncate text-sm text-indigo-600 hover:underline dark:text-indigo-400">{c.link}</a>}
            <button className="ml-auto text-sm text-red-600 hover:underline" onClick={() => remove(c)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
