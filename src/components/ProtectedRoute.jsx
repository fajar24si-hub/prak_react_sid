import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Tampilkan loading saat masih memeriksa auth
  if (loading) {
    return <Loading />
  }

  // Jika belum login, redirect ke login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Jika ada allowedRoles dan role user tidak termasuk
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect berdasarkan role
    if (profile.role === 'admin') {
      return <Navigate to="/" replace />
    } else if (profile.role === 'member' || profile.role === 'guest') {
      return <Navigate to="/member/dashboard" replace />
    } else {
      return <Navigate to="/member/dashboard" replace />
    }
  }

  return children
}