import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-primary text-primary">
        <div className="w-10 h-10 border-[3px] border-white/10 border-t-purple-500 rounded-full animate-spin mb-6"></div>
        <p className="text-[1rem] text-secondary m-0">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute