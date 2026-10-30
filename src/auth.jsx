import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!getToken())

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me/')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const { token } = await api('/auth/login/', { method: 'POST', body: { username, password } })
    setToken(token)
    setUser(await api('/auth/me/'))
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
