import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { MONTHS, money, todayISO } from '../utils'

export default function Calculator() {
  const now = new Date()
  const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [data, setData] = useState(null)
  // Editable inputs per group: { [groupId]: { percent, sum } }
  const [inputs, setInputs] = useState({})
  const [advance, setAdvance] = useState({ amount: '', received_at: todayISO(), note: '' })
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api(`/salary/?year=${ym.year}&month=${ym.month}`).then((d) => {
      setData(d)
      setInputs(Object.fromEntries(d.groups.map((g) => [g.id, { percent: Number(g.teacher_percent), sum: Number(g.collected) }])))
    })
  }, [ym])

  useEffect(() => {
    load()
  }, [load])

  function shift(delta) {
    const d = new Date(ym.year, ym.month - 1 + delta, 1)
    setYm({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }

  const setInput = (id, key) => (e) => setInputs({ ...inputs, [id]: { ...inputs[id], [key]: e.target.value } })

  async function savePercent(g) {
    await api(`/groups/${g.id}/`, { method: 'PATCH', body: { teacher_percent: inputs[g.id].percent } })
    load()
  }

  async function addAdvance(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/advances/', { method: 'POST', body: { ...advance, year: ym.year, month: ym.month } })
      setAdvance({ amount: '', received_at: todayISO(), note: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteAdvance(a) {
    if (!confirm('Delete this advance?')) return
    await api(`/advances/${a.id}/`, { method: 'DELETE' })
    load()
  }

  if (!data) return <p className="text-slate-500">Loading…</p>

  const rows = data.groups.map((g) => {
    const inp = inputs[g.id] || { percent: 0, sum: 0 }
    const share = (Number(inp.sum) || 0) * (Number(inp.percent) || 0) / 100
    return { ...g, inp, share }
  })
  const totalSum = rows.reduce((t, r) => t + (Number(r.inp.sum) || 0), 0)
  const totalShare = rows.reduce((t, r) => t + r.share, 0)
  const advanceTotal = data.advances.reduce((t, a) => t + Number(a.amount), 0)
  const remaining = totalShare - advanceTotal

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold">Salary calculator</h1>
        <button className="btn btn-ghost" onClick={() => shift(-1)}>←</button>
        <span className="w-40 text-center font-semibold">{MONTHS[ym.month - 1]} {ym.year}</span>
        <button className="btn btn-ghost" onClick={() => shift(1)}>→</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Big label="Collected from groups" value={money(totalSum)} />
        <Big label="My share" value={money(totalShare)} cls="text-indigo-600 dark:text-indigo-400" />
        <Big label="Received in advance" value={`− ${money(advanceTotal)}`} cls="text-orange-500" />
        <Big label="Remaining to receive" value={money(remaining)} cls={remaining < 0 ? 'text-red-600' : 'text-emerald-600'} />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Paid students</th>
              <th className="px-4 py-3">Overall sum</th>
              <th className="px-4 py-3">My percentage</th>
              <th className="px-4 py-3 text-right">My share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.level_display}</div>
                </td>
                <td className="px-4 py-3">
                  {r.paid_count}/{r.student_count}
                  <div className="text-xs text-slate-500">expected {money(r.expected)}</div>
                </td>
                <td className="px-4 py-3">
                  <input className="input w-36" type="number" min="0" step="any" value={r.inp.sum} onChange={setInput(r.id, 'sum')} />
                  {Number(r.inp.sum) !== Number(r.collected) && (
                    <div className="text-xs text-slate-500">recorded: {money(r.collected)}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <input className="input w-20" type="number" min="0" max="100" step="any" value={r.inp.percent} onChange={setInput(r.id, 'percent')} />
                    <span>%</span>
                    {Number(r.inp.percent) !== Number(r.teacher_percent) && (
                      <button className="btn btn-ghost px-2 py-1 text-xs" onClick={() => savePercent(r)} title="Save as this group's default">save</button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-base font-semibold">{money(r.share)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No groups yet.</td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="border-t-2 border-slate-200 font-semibold dark:border-slate-700">
              <tr>
                <td className="px-4 py-3" colSpan="2">Total</td>
                <td className="px-4 py-3">{money(totalSum)}</td>
                <td></td>
                <td className="px-4 py-3 text-right text-base">{money(totalShare)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">Salary received in advance — {MONTHS[ym.month - 1]}</h2>
        <form onSubmit={addAdvance} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Amount</label>
            <input className="input w-36" type="number" min="0" step="any" required value={advance.amount} onChange={(e) => setAdvance({ ...advance, amount: e.target.value })} />
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={advance.received_at} onChange={(e) => setAdvance({ ...advance, received_at: e.target.value })} />
          </div>
          <div className="min-w-48 flex-1">
            <label className="label">Note</label>
            <input className="input" value={advance.note} onChange={(e) => setAdvance({ ...advance, note: e.target.value })} />
          </div>
          <button className="btn btn-primary">+ Add advance</button>
        </form>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {data.advances.length === 0 ? (
          <p className="text-sm text-slate-500">No advances this month.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.advances.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-24 text-slate-500">{a.received_at}</span>
                <span className="w-32 font-semibold">{money(a.amount)}</span>
                <span className="flex-1 text-slate-500">{a.note}</span>
                <button className="text-red-600 hover:underline" onClick={() => deleteAdvance(a)}>delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Big({ label, value, cls = '' }) {
  return (
    <div className="card">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
    </div>
  )
}
