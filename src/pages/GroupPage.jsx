import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import GroupForm from '../components/GroupForm.jsx'
import Modal from '../components/Modal.jsx'
import PaymentForm from '../components/PaymentForm.jsx'
import StudentForm from '../components/StudentForm.jsx'
import { useI18n } from '../i18n.jsx'
import { ROW_COLORS, STATUS_BADGE, lessonDaysLabel, money, todayISO } from '../utils'

export default function GroupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, months, weekdays, levels } = useI18n()
  const [group, setGroup] = useState(null)
  const [students, setStudents] = useState([])
  const [channels, setChannels] = useState([])
  const [tab, setTab] = useState('students')
  const [modal, setModal] = useState(null) // 'edit' | 'add' | {pay: student}
  const [showInactive, setShowInactive] = useState(false)

  const load = useCallback(() => {
    api(`/groups/${id}/`).then(setGroup)
    api(`/students/?group=${id}`).then(setStudents)
    api('/channels/').then(setChannels)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function deleteGroup() {
    if (!confirm(t('group.confirmDelete', { name: group.name }))) return
    await api(`/groups/${id}/`, { method: 'DELETE' })
    navigate('/')
  }

  if (!group) return <p className="text-slate-500">{t('common.loading')}</p>

  const visible = students.filter((s) => showInactive || s.is_active)

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">{t('group.back')}</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-slate-500">
            {levels[group.level] || group.level_display} · {lessonDaysLabel(group.lesson_days, weekdays)} {group.lesson_time} · {t('group.fee')} {money(group.monthly_fee)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setModal('edit')}>{t('group.edit')}</button>
          <button className="btn btn-danger" onClick={deleteGroup}>{t('common.delete')}</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {[['students', t('group.tabStudents')], ['attendance', t('group.tabAttendance')]].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'students' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Legend />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> {t('group.showInactive')}
              </label>
              <button className="btn btn-primary" onClick={() => setModal('add')}>{t('group.addStudent')}</button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">{t('col.student')}</th>
                  <th className="px-3 py-2">{t('col.phone')}</th>
                  <th className="px-3 py-2">{t('col.parentPhone')}</th>
                  <th className="px-3 py-2">{t('col.channels')}</th>
                  <th className="px-3 py-2">{t('col.discount')}</th>
                  <th className="px-3 py-2">{t('col.payment', { month: months[new Date().getMonth()] })}</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr><td colSpan="8" className="px-3 py-6 text-center text-slate-500">{t('group.noStudents')}</td></tr>
                )}
                {visible.map((s, i) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/students/${s.id}`)}
                    className={`cursor-pointer border-t border-slate-200 dark:border-slate-800 ${ROW_COLORS[s.payment_status]} ${s.is_active ? '' : 'opacity-50'}`}
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{s.full_name}</td>
                    <td className="px-3 py-2"><Phone n={s.phone} /></td>
                    <td className="px-3 py-2"><Phone n={s.parent_phone} /></td>
                    <td className="px-3 py-2">
                      <ChannelDots student={s} channels={channels} />
                    </td>
                    <td className="px-3 py-2">
                      {s.discount_type === 'none' ? '—' : (
                        <span className={s.discount_active ? '' : 'line-through opacity-60'} title={s.discount_reason}>
                          {Number(s.discount_percent)}% {s.discount_type === 'temporary' ? t('discount.till', { date: s.discount_until }) : t('discount.permanentShort')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`badge ${STATUS_BADGE[s.payment_status]}`}>{t(`status.${s.payment_status}`)}</span>
                      {s.current_payment && <span className="ml-2 text-xs opacity-70">{money(s.current_payment.amount)}</span>}
                    </td>
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      {s.payment_status !== 'paid' && (
                        <button className="btn btn-primary px-2 py-1 text-xs" onClick={() => setModal({ pay: s })}>{t('group.markPaid')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <AttendanceGrid groupId={id} />
      )}

      {modal === 'edit' && (
        <Modal title={t('group.edit')} onClose={() => setModal(null)}>
          <GroupForm group={group} onSaved={() => { setModal(null); load() }} />
        </Modal>
      )}
      {modal === 'add' && (
        <Modal title={t('group.newStudent')} wide onClose={() => setModal(null)}>
          <StudentForm groupId={group.id} onSaved={() => { setModal(null); load() }} />
        </Modal>
      )}
      {modal?.pay && (
        <Modal title={t('group.recordPayment')} onClose={() => setModal(null)}>
          <PaymentForm student={modal.pay} onSaved={() => { setModal(null); load() }} />
        </Modal>
      )}
    </div>
  )
}

function Phone({ n }) {
  if (!n) return <span className="opacity-50">—</span>
  return <a href={`tel:${n}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{n}</a>
}

function ChannelDots({ student, channels }) {
  const { t } = useI18n()
  if (!channels.length) return <span className="opacity-50">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {channels.map((c) => {
        const on = student.channels.includes(c.id)
        return (
          <span key={c.id} title={`${c.name}: ${on ? t('channel.subscribed') : t('channel.notSubscribed')}`} className={`badge ${on ? 'bg-emerald-600 text-white' : 'bg-slate-400/40'}`}>
            {on ? '✓' : '✗'} {c.name}
          </span>
        )
      })}
    </div>
  )
}

function Legend() {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded bg-orange-300" /> {t('legend.pending')}</span>
      <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded bg-red-400" /> {t('legend.overdue')}</span>
      <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded border border-slate-400 bg-white dark:bg-black" /> {t('legend.paid')}</span>
    </div>
  )
}

const CYCLE = [null, 'present', 'absent', 'late']
const CELL = {
  present: { txt: '✓', cls: 'bg-emerald-500 text-white' },
  absent: { txt: '✗', cls: 'bg-red-500 text-white' },
  late: { txt: null, cls: 'bg-amber-400 text-black' }, // letter depends on the language
}

function AttendanceGrid({ groupId }) {
  const { t, months, weekdays } = useI18n()
  const now = new Date()
  const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [data, setData] = useState(null)
  const today = todayISO()

  const load = useCallback(
    () => api(`/groups/${groupId}/attendance/?year=${ym.year}&month=${ym.month}`).then(setData),
    [groupId, ym],
  )
  useEffect(() => {
    load()
  }, [load])

  function shift(delta) {
    const d = new Date(ym.year, ym.month - 1 + delta, 1)
    setYm({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }

  async function mark(studentId, date, status) {
    // Optimistic update; reload from the server if the request fails
    setData((d) => ({ ...d, records: { ...d.records, [studentId]: { ...(d.records[studentId] || {}), [date]: status } } }))
    try {
      await api('/attendance/mark/', { method: 'POST', body: { student: studentId, date, status } })
    } catch (e) {
      load()
      alert(e.message)
    }
  }

  function cycle(studentId, date) {
    const cur = data.records[studentId]?.[date] || null
    mark(studentId, date, CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length])
  }

  function markAllPresent(date) {
    data.students.forEach((s) => {
      if (!data.records[s.id]?.[date]) mark(s.id, date, 'present')
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-ghost" onClick={() => shift(-1)}>←</button>
        <span className="w-40 text-center font-semibold">{months[ym.month - 1]} {ym.year}</span>
        <button className="btn btn-ghost" onClick={() => shift(1)}>→</button>
        <span className="ml-auto text-xs text-slate-500">{t('att.hint', { late: t('att.lateMark') })}</span>
      </div>
      {!data ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : data.dates.length === 0 ? (
        <p className="card text-slate-500">{t('att.noDays')}</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="text-sm">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="sticky left-0 bg-white px-3 py-2 text-left dark:bg-slate-900">{t('col.student')}</th>
                {data.dates.map((d) => {
                  const dt = new Date(d + 'T00:00')
                  return (
                    <th key={d} className={`px-1 py-2 text-center ${d === today ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                      <div>{weekdays[(dt.getDay() + 6) % 7]}</div>
                      <div className="text-base font-bold">{dt.getDate()}</div>
                      <button className="text-[10px] text-indigo-500 hover:underline" onClick={() => markAllPresent(d)} title={t('att.allPresentTitle')}>{t('att.allPresent')}</button>
                    </th>
                  )
                })}
                <th className="px-3 py-2">{t('att.present')}</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => {
                const rec = data.records[s.id] || {}
                const present = Object.values(rec).filter((v) => v === 'present' || v === 'late').length
                return (
                  <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="sticky left-0 whitespace-nowrap bg-white px-3 py-1 dark:bg-slate-900">
                      <Link to={`/students/${s.id}`} className="hover:underline">{s.full_name}</Link>
                    </td>
                    {data.dates.map((d) => {
                      const c = CELL[rec[d]]
                      return (
                        <td key={d} className={`px-1 py-1 text-center ${d === today ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}>
                          <button
                            onClick={() => cycle(s.id, d)}
                            className={`h-8 w-8 rounded-md border border-slate-200 font-bold dark:border-slate-700 ${c ? c.cls : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            {c ? (c.txt ?? t('att.lateMark')) : ''}
                          </button>
                        </td>
                      )
                    })}
                    <td className="px-3 text-center text-slate-500">{present}/{data.dates.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
