import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import GroupForm from '../components/GroupForm.jsx'
import Modal from '../components/Modal.jsx'
import { MONTHS, lessonDaysLabel, money } from '../utils'

const LEVEL_COLORS = {
  beginner: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  elementary: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
  pre_intermediate: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  intermediate: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
  upper_intermediate: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-200',
  advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
}

export default function Dashboard() {
  const [groups, setGroups] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = () => api('/groups/').then(setGroups).catch((e) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  const now = new Date()
  const totals = (groups || []).reduce(
    (t, g) => ({
      students: t.students + g.student_count,
      paid: t.paid + g.paid_count,
      pending: t.pending + g.pending_count,
      overdue: t.overdue + g.overdue_count,
    }),
    { students: 0, paid: 0, pending: 0, overdue: 0 },
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My groups</h1>
          <p className="text-sm text-slate-500">Payments for {MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ New group</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Students" value={totals.students} />
        <Stat label="Paid" value={totals.paid} cls="text-emerald-600" />
        <Stat label="Not paid yet" value={totals.pending} cls="text-orange-500" />
        <Stat label="Overdue (5th+)" value={totals.overdue} cls="text-red-600" />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {!groups ? (
        <p className="text-slate-500">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="card text-center text-slate-500">No groups yet. Create your first group.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-center">Students</th>
                <th className="px-4 py-3">Payments this month</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <Link to={`/groups/${g.id}`} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">{g.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${LEVEL_COLORS[g.level]}`}>{g.level_display}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {lessonDaysLabel(g.lesson_days)} {g.lesson_time && `· ${g.lesson_time}`}
                  </td>
                  <td className="px-4 py-3 text-right">{money(g.monthly_fee)}</td>
                  <td className="px-4 py-3 text-center">{g.student_count}</td>
                  <td className="px-4 py-3">
                    <PaymentBar g={g} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal title="New group" onClose={() => setCreating(false)}>
          <GroupForm onSaved={() => { setCreating(false); load() }} />
        </Modal>
      )}
    </div>
  )
}

function Stat({ label, value, cls = '' }) {
  return (
    <div className="card">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
    </div>
  )
}

function PaymentBar({ g }) {
  const total = g.student_count || 1
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="bg-emerald-500" style={{ width: `${(g.paid_count / total) * 100}%` }} />
        <div className="bg-orange-400" style={{ width: `${(g.pending_count / total) * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${(g.overdue_count / total) * 100}%` }} />
      </div>
      <span className="text-xs text-slate-500">{g.paid_count}/{g.student_count} paid</span>
    </div>
  )
}
