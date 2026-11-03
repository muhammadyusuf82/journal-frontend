import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { LanguageSwitcher, useI18n } from '../i18n.jsx'
import { useTheme } from '../theme.js'

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { t } = useI18n()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 text-lg font-bold">📒 {t('app.title')}</span>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={linkCls}>{t('nav.groups')}</NavLink>
            <NavLink to="/calculator" className={linkCls}>{t('nav.calculator')}</NavLink>
            <NavLink to="/channels" className={linkCls}>{t('nav.channels')}</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={toggle} className="btn btn-ghost" title={t('theme.toggle')}>
              {dark ? t('theme.light') : t('theme.dark')}
            </button>
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.first_name || user?.username}</span>
            <button onClick={logout} className="btn btn-ghost">{t('common.logout')}</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
