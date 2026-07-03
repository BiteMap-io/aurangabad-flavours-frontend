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

    // api.js fires this when a request 401s and the token is purged.
    const onUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
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

  const signup = async (name, email, password, userType = 'customer') => {
    const res = await api.post('/auth/signup', { name, email, password, userType })
    if (res.token) {
      localStorage.setItem('userToken', res.token)
      localStorage.setItem('userData', JSON.stringify(res.user))
      setUser(res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Signup failed' }
  }

  const guestLogin = async (name, email, phone) => {
    const res = await api.post('/auth/guest', { name, email, phone })
    if (res.token) {
      localStorage.setItem('userToken', res.token)
      localStorage.setItem('userData', JSON.stringify(res.user))
      setUser(res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Guest login failed' }
  }

  const logout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    setUser(null)
  }

  const isOwner = user?.userType === 'restaurant_owner'
  const isGuest = user?.userType === 'guest'

  return (
    <UserAuthContext.Provider value={{ user, loading, login, signup, guestLogin, logout, isLoggedIn: !!user, isOwner, isGuest }}>
      {children}
    </UserAuthContext.Provider>
  )
}
