import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AdminAuthContext = createContext()

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const adminToken = localStorage.getItem('adminToken')
      const adminData = localStorage.getItem('adminUser')
      
      if (adminToken && adminData) {
        try {
          const user = JSON.parse(adminData)
          setAdminUser(user)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Invalid admin session data')
          logout()
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.token) {
        const { token, user } = response;
        
        // Store auth data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        setAdminUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setAdminUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    adminUser,
    loading,
    login,
    logout
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export default AdminAuthContext