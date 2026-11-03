import { useEffect, useState } from 'react'
import { api } from '../api'
import { useI18n } from '../i18n.jsx'
import { todayISO } from '../utils'

export default function StudentForm({ student, groupId, onSaved }) {
  const { t } = useI18n()
  const [channels, setChannels] = useState([])
  const [groups, setGroups] = useState([])
  const [form, setForm] = useState({
    group: student?.group || groupId,
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    phone: student?.phone || '',
    parent_name: student?.parent_name || '',
    parent_phone: student?.parent_phone || '',
    birth_date: student?.birth_date || '',
    joined_at: student?.joined_at || todayISO(),
    channels: student?.channels || [],
    discount_type: student?.discount_type || 'none',
    discount_percent: student?.discount_percent || 0,
    discount_until: student?.discount_until || '',
    discount_reason: student?.discount_reason || '',
    notes: student?.notes || '',
    is_active: student?.is_active ?? true,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    api('/channels/').then(setChannels)
    api('/groups/').then(setGroups)
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function toggleChannel(id) {
    setForm({ ...form, channels: form.channels.includes(id) ? form.channels.filter((c) => c !== id) : [...form.channels, id] })
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const body = { ...form, birth_date: form.birth_date || null, discount_until: form.discount_until || null }
    try {
      const saved = student
        ? await api(`/students/${student.id}/`, { method: 'PATCH', body })
        : await api('/students/', { method: 'POST', body })
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t('sf.firstName')}</label>
          <input className="input" required value={form.first_name} onChange={set('first_name')} />
        </div>
        <div>
          <label className="label">{t('sf.lastName')}</label>
          <input className="input" value={form.last_name} onChange={set('last_name')} />
        </div>
        <div>
          <label className="label">{t('sf.phone')}</label>
          <input className="input" type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">{t('sf.birth')}</label>
          <input className="input" type="date" value={form.birth_date} onChange={set('birth_date')} />
        </div>
        <div>
          <label className="label">{t('sf.parentName')}</label>
          <input className="input" value={form.parent_name} onChange={set('parent_name')} />
        </div>
        <div>
          <label className="label">{t('sf.parentPhone')}</label>
          <input className="input" type="tel" value={form.parent_phone} onChange={set('parent_phone')} />
        </div>
        <div>
          <label className="label">{t('sf.group')}</label>
          <select className="input" value={form.group} onChange={set('group')}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('sf.joined')}</label>
          <input className="input" type="date" value={form.joined_at} onChange={set('joined_at')} />
        </div>
      </div>

      <div>
        <label className="label">{t('sf.channels')}</label>
        {channels.length === 0 ? (
          <p className="text-sm text-slate-500">{t('sf.noChannels')}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {channels.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.channels.includes(c.id)} onChange={() => toggleChannel(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <legend className="px-1 text-xs font-medium text-slate-500">{t('sf.discount')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('sf.type')}</label>
            <select className="input" value={form.discount_type} onChange={set('discount_type')}>
              <option value="none">{t('sf.none')}</option>
              <option value="temporary">{t('sf.temporary')}</option>
              <option value="permanent">{t('sf.permanent')}</option>
            </select>
          </div>
          {form.discount_type !== 'none' && (
            <div>
              <label className="label">{t('sf.percent')}</label>
              <input className="input" type="number" min="1" max="100" step="any" required value={form.discount_percent} onChange={set('discount_percent')} />
            </div>
          )}
          {form.discount_type === 'temporary' && (
            <div>
              <label className="label">{t('sf.until')}</label>
              <input className="input" type="date" required value={form.discount_until} onChange={set('discount_until')} />
            </div>
          )}
          {form.discount_type !== 'none' && (
            <div className={form.discount_type === 'temporary' ? '' : 'col-span-2'}>
              <label className="label">{t('sf.reason')}</label>
              <input className="input" value={form.discount_reason} onChange={set('discount_reason')} />
            </div>
          )}
        </div>
      </fieldset>

      <div>
        <label className="label">{t('sf.notes')}</label>
        <textarea className="input" rows="2" value={form.notes} onChange={set('notes')} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_active} onChange={set('is_active')} /> {t('sf.active')}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn btn-primary w-full">{student ? t('common.save') : t('sf.add')}</button>
    </form>
  )
}
