import { useState } from 'react'
import { api } from '../api'
import { MONTHS, todayISO } from '../utils'

// Records a monthly payment. Defaults to the current month and the student's due amount.
export default function PaymentForm({ student, year, month, onSaved }) {
  const now = new Date()
  const [form, setForm] = useState({
    year: year || now.getFullYear(),
    month: month || now.getMonth() + 1,
    amount: student.monthly_due,
    paid_at: todayISO(),
    note: '',
  })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    try {
      await api('/payments/', { method: 'POST', body: { ...form, student: student.id } })
      onSaved()
    } catch (err) {
      setError(err.message.includes('unique') ? 'This month is already paid.' : err.message)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm">
        <b>{student.full_name}</b> · due {student.monthly_due}
        {student.discount_active && <span className="ml-1 text-emerald-600">(discount {Number(student.discount_percent)}%)</span>}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Month</label>
          <select className="input" value={form.month} onChange={set('month')}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Year</label>
          <input className="input" type="number" value={form.year} onChange={set('year')} />
        </div>
        <div>
          <label className="label">Amount</label>
          <input className="input" type="number" min="0" step="any" required value={form.amount} onChange={set('amount')} />
        </div>
        <div>
          <label className="label">Paid on</label>
          <input className="input" type="date" value={form.paid_at} onChange={set('paid_at')} />
        </div>
      </div>
      <input className="input" placeholder="Note (optional)" value={form.note} onChange={set('note')} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn btn-primary w-full">Mark as paid</button>
    </form>
  )
}
