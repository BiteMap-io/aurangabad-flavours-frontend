import { Navigate, useLocation } from 'react-router-dom'
import { useUserAuth } from '../../context/UserAuthContext'

const OwnerProtectedRoute = ({ children }) => {
  const { isLoggedIn, isOwner, loading } = useUserAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-primary text-primary">
        <div className="w-10 h-10 border-[3px] border-white/10 border-t-purple-500 rounded-full animate-spin mb-6"></div>
        <p className="text-[1rem] text-secondary m-0">Loading...</p>
      </div>
    )
  }

  if (!isLoggedIn || !isOwner) {
    return <Navigate to="/partner" state={{ from: location }} replace />
  }

  return children
}

export default OwnerProtectedRoute
