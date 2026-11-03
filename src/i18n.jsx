/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { DICTIONARIES, LANGUAGES } from './translations'

const I18nContext = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem('lang')
    if (saved && DICTIONARIES[saved]) return saved
  } catch {
    /* storage unavailable */
  }
  const browser = (navigator.language || '').slice(0, 2)
  return DICTIONARIES[browser] ? browser : 'uz'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = DICTIONARIES[lang].t['app.title']
  }, [lang])

  function setLang(next) {
    try {
      localStorage.setItem('lang', next)
    } catch {
      /* storage unavailable */
    }
    setLangState(next)
  }

  const dict = DICTIONARIES[lang]

  // t('key', {name: 'x'}) -> text in the current language (falls back to English, then the key)
  function t(key, vars) {
    let text = dict.t[key] ?? DICTIONARIES.en.t[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v)
    return text
  }

  const value = { lang, setLang, t, months: dict.months, weekdays: dict.weekdays, levels: dict.levels }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div className={`inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 ${className}`} role="group" aria-label={t('common.language')}>
      {LANGUAGES.map(([code, name, short]) => (
        <button
          key={code}
          type="button"
          title={name}
          onClick={() => setLang(code)}
          className={`cursor-pointer px-2.5 py-2 text-xs font-semibold ${lang === code ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          {short}
        </button>
      ))}
    </div>
  )
}
