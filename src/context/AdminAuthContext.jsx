import { createContext, useContext, useState, useEffect } from 'react'

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
      // Mock authentication - replace with real API call
      const { email, password } = credentials
      
      // Demo admin credentials
      if (email === 'admin@aurangabadflavors.com' && password === 'admin123') {
        const adminData = {
          id: 1,
          name: 'Admin User',
          email: 'admin@aurangabadflavors.com',
          role: 'admin'
        }
        
        // Store auth data
        localStorage.setItem('adminToken', 'mock-admin-token')
        localStorage.setItem('adminUser', JSON.stringify(adminData))
        
        setAdminUser(adminData)
        setIsAuthenticated(true)
        
        return { success: true }
      } else {
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      return { success: false, error: 'Login failed' }
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