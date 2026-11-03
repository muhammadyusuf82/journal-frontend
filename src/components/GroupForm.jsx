import { useState } from 'react'
import { api } from '../api'
import { useI18n } from '../i18n.jsx'
import { LEVEL_KEYS } from '../utils'

export default function GroupForm({ group, onSaved }) {
  const { t, weekdays, levels } = useI18n()
  const [form, setForm] = useState({
    name: group?.name || '',
    level: group?.level || 'beginner',
    lesson_days: group?.lesson_days || '0,2,4',
    lesson_time: group?.lesson_time || '',
    monthly_fee: group?.monthly_fee || '',
    teacher_percent: group?.teacher_percent ?? 40,
  })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const days = form.lesson_days.split(',').filter(Boolean).map(Number)

  function toggleDay(d) {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d]
    setForm({ ...form, lesson_days: next.sort().join(',') })
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const saved = group
        ? await api(`/groups/${group.id}/`, { method: 'PATCH', body: form })
        : await api('/groups/', { method: 'POST', body: form })
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">{t('groupForm.name')}</label>
        <input className="input" required value={form.name} onChange={set('name')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t('col.level')}</label>
          <select className="input" value={form.level} onChange={set('level')}>
            {LEVEL_KEYS.map((v) => <option key={v} value={v}>{levels[v]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('groupForm.time')}</label>
          <input className="input" placeholder="18:00" value={form.lesson_time} onChange={set('lesson_time')} />
        </div>
      </div>
      <div>
        <label className="label">{t('groupForm.days')}</label>
        <div className="flex flex-wrap gap-1">
          {weekdays.map((w, i) => (
            <button
              type="button"
              key={i}
              onClick={() => toggleDay(i)}
              className={`btn px-2 py-1 ${days.includes(i) ? 'bg-indigo-600 text-white' : 'btn-ghost'}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t('groupForm.fee')}</label>
          <input className="input" type="number" min="0" step="any" required value={form.monthly_fee} onChange={set('monthly_fee')} />
        </div>
        <div>
          <label className="label">{t('groupForm.percent')}</label>
          <input className="input" type="number" min="0" max="100" step="any" value={form.teacher_percent} onChange={set('teacher_percent')} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn btn-primary w-full">{group ? t('common.save') : t('groupForm.create')}</button>
    </form>
  )
}
