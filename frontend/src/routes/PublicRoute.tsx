import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PublicRoute() {
  return useAuth().isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
