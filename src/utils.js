export const LEVEL_KEYS = ['beginner', 'elementary', 'pre_intermediate', 'intermediate', 'upper_intermediate', 'advanced']

export function money(v) {
  const n = Number(v || 0)
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, ' ')
}

// Student row colours by payment status for the current month:
// pending = month started, unpaid (orange); overdue = 5th day or later, unpaid (red);
// paid = plain white / black depending on theme.
export const ROW_COLORS = {
  pending: 'bg-orange-200 text-orange-950 dark:bg-orange-500/30 dark:text-orange-50',
  overdue: 'bg-red-200 text-red-950 dark:bg-red-600/35 dark:text-red-50',
  paid: 'bg-white text-slate-900 dark:bg-black dark:text-slate-100',
}

export const STATUS_BADGE = {
  pending: 'bg-orange-500 text-white',
  overdue: 'bg-red-600 text-white',
  paid: 'bg-emerald-600 text-white',
}

// Today's date as YYYY-MM-DD in local time (toISOString would use UTC)
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function lessonDaysLabel(days, weekdays) {
  return (days || '')
    .split(',')
    .filter(Boolean)
    .map((d) => weekdays[+d])
    .join(', ')
}
