import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
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