import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Modal from '../components/Modal.jsx'
import PaymentForm from '../components/PaymentForm.jsx'
import StudentForm from '../components/StudentForm.jsx'
import { useI18n } from '../i18n.jsx'
import { STATUS_BADGE, money } from '../utils'

const ATT_BADGE = {
  present: 'bg-emerald-600 text-white',
  absent: 'bg-red-600 text-white',
  late: 'bg-amber-400 text-black',
}

export default function StudentCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, months } = useI18n()
  const now = new Date()
  const [student, setStudent] = useState(null)
  const [summary, setSummary] = useState(null)
  const [channels, setChannels] = useState([])
  const [year, setYear] = useState(now.getFullYear())
  const [modal, setModal] = useState(null) // 'edit' | {payMonth}

  const load = useCallback(() => {
    api(`/students/${id}/`).then(setStudent)
    api(`/students/${id}/summary/?year=${year}`).then(setSummary)
    api('/channels/').then(setChannels)
  }, [id, year])

  useEffect(() => {
    load()
  }, [load])

  async function remove() {
    if (!confirm(t('card.confirmDelete', { name: student.full_name }))) return
    await api(`/students/${id}/`, { method: 'DELETE' })
    navigate(`/groups/${student.group}`)
  }

  async function cancelPayment(p) {
    if (!confirm(t('card.confirmCancelPay', { month: months[p.month - 1], year: p.year }))) return
    await api(`/payments/${p.id}/`, { method: 'DELETE' })
    load()
  }

  if (!student || !summary) return <p className="text-slate-500">{t('common.loading')}</p>

  const curY = now.getFullYear()
  const curM = now.getMonth() + 1
  const att = summary.attendance
  const attTotal = att.present + att.late + att.absent

  return (
    <div className="space-y-4">
      <Link to={`/groups/${student.group}`} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">← {student.group_name}</Link>

      <div className="card flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
          {student.first_name[0]}{student.last_name?.[0] || ''}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.full_name}</h1>
          <p className="text-sm text-slate-500">
            {student.group_name} · {t('card.joined', { date: student.joined_at })} {!student.is_active && <span className="badge ml-1 bg-slate-500 text-white">{t('card.inactive')}</span>}
          </p>
        </div>
        <div className="text-right">
          <span className={`badge text-sm ${STATUS_BADGE[student.payment_status]}`}>{t(`status.${student.payment_status}`)}</span>
          <div className="mt-1 text-sm text-slate-500">{t('card.monthlyDue')}: <b>{money(student.monthly_due)}</b></div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setModal('edit')}>{t('common.edit')}</button>
          <button className="btn btn-danger" onClick={remove}>{t('common.delete')}</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-3">
          <h2 className="font-semibold">{t('card.contacts')}</h2>
          <Info label={t('col.phone')} value={student.phone && <a className="text-indigo-600 hover:underline dark:text-indigo-400" href={`tel:${student.phone}`}>{student.phone}</a>} />
          <Info label={t('card.parent')} value={student.parent_name} />
          <Info label={t('col.parentPhone')} value={student.parent_phone && <a className="text-indigo-600 hover:underline dark:text-indigo-400" href={`tel:${student.parent_phone}`}>{student.parent_phone}</a>} />
          <Info label={t('sf.birth')} value={student.birth_date} />
          {student.notes && <Info label={t('sf.notes')} value={<span className="whitespace-pre-wrap">{student.notes}</span>} />}
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold">{t('col.channels')}</h2>
          {channels.length === 0 ? (
            <p className="text-sm text-slate-500">{t('card.noChannels')}</p>
          ) : (
            <ul className="space-y-1">
              {channels.map((c) => {
                const on = student.channels.includes(c.id)
                return (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className={`badge ${on ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{on ? t('card.subscribed') : t('card.notSubscribed')}</span>
                  </li>
                )
              })}
            </ul>
          )}
          <h2 className="pt-2 font-semibold">{t('col.discount')}</h2>
          {student.discount_type === 'none' ? (
            <p className="text-sm text-slate-500">{t('sf.none')}</p>
          ) : (
            <div className="text-sm">
              <span className="text-lg font-bold">{Number(student.discount_percent)}%</span>{' '}
              <span className="badge bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">{t(`sf.${student.discount_type}`)}</span>
              {student.discount_type === 'temporary' && (
                <div className="text-slate-500">
                  {t('card.until', { date: student.discount_until })} {!student.discount_active && <b className="text-red-600">{t('card.expired')}</b>}
                </div>
              )}
              {student.discount_reason && <div className="text-slate-500">{student.discount_reason}</div>}
            </div>
          )}
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold">{t('card.attendance')}</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-xl font-bold text-emerald-600">{att.present}</div><div className="text-xs text-slate-500">{t('card.present')}</div></div>
            <div><div className="text-xl font-bold text-amber-500">{att.late}</div><div className="text-xs text-slate-500">{t('card.late')}</div></div>
            <div><div className="text-xl font-bold text-red-600">{att.absent}</div><div className="text-xs text-slate-500">{t('card.absent')}</div></div>
          </div>
          {attTotal > 0 && (
            <p className="text-center text-sm text-slate-500">{t('card.rate')}: <b>{Math.round(((att.present + att.late) / attTotal) * 100)}%</b></p>
          )}
          <div className="flex flex-wrap gap-1">
            {summary.recent_attendance.map((a) => (
              <span key={a.date} className={`badge ${ATT_BADGE[a.status]}`} title={t(`card.${a.status}`)}>{a.date.slice(5)}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-semibold">{t('card.monthlyPayments')}</h2>
          <div className="ml-auto flex items-center gap-1">
            <button className="btn btn-ghost px-2 py-1" onClick={() => setYear(year - 1)}>←</button>
            <span className="w-14 text-center font-semibold">{year}</span>
            <button className="btn btn-ghost px-2 py-1" onClick={() => setYear(year + 1)}>→</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {months.map((m, i) => {
            const month = i + 1
            const p = summary.payments[month]
            const isFuture = year > curY || (year === curY && month > curM)
            const isCurrent = year === curY && month === curM
            let cls = 'border-slate-200 dark:border-slate-700'
            if (p) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
            else if (isCurrent) cls = student.payment_status === 'overdue' ? 'border-red-500 bg-red-50 dark:bg-red-950/40' : 'border-orange-400 bg-orange-50 dark:bg-orange-950/40'
            else if (!isFuture) cls = 'border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
            return (
              <div key={m} className={`rounded-lg border-2 p-2 text-sm ${cls}`}>
                <div className="font-medium">{m}</div>
                {p ? (
                  <>
                    <div className="text-emerald-700 dark:text-emerald-400">✓ {money(p.amount)}</div>
                    <div className="text-xs text-slate-500">{p.paid_at}</div>
                    <button className="text-xs text-red-600 hover:underline" onClick={() => cancelPayment(p)}>{t('common.cancel')}</button>
                  </>
                ) : (
                  <>
                    <div className="text-slate-500">{isFuture ? '—' : t('card.notPaid')}</div>
                    <button className="text-xs text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => setModal({ payMonth: month })}>
                      {t('card.recordPayment')}
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {modal === 'edit' && (
        <Modal title={t('card.editStudent')} wide onClose={() => setModal(null)}>
          <StudentForm student={student} onSaved={() => { setModal(null); load() }} />
        </Modal>
      )}
      {modal?.payMonth && (
        <Modal title={t('group.recordPayment')} onClose={() => setModal(null)}>
          <PaymentForm student={student} year={year} month={modal.payMonth} onSaved={() => { setModal(null); load() }} />
        </Modal>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm">{value || <span className="text-slate-400">—</span>}</div>
    </div>
  )
}
