import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const UserAuthContext = createContext()

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
  return ctx
}

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const stored = localStorage.getItem('userData')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.token) {
      localStorage.setItem('userToken', res.token)
      localStorage.setItem('userData', JSON.stringify(res.user))
      setUser(res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Login failed' }
  }

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password, userType: 'customer' })
    if (res.token) {
      localStorage.setItem('userToken', res.token)
      localStorage.setItem('userData', JSON.stringify(res.user))
      setUser(res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Signup failed' }
  }

  const logout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    setUser(null)
  }

  return (
    <UserAuthContext.Provider value={{ user, loading, login, signup, logout, isLoggedIn: !!user }}>
      {children}
    </UserAuthContext.Provider>
  )
}
