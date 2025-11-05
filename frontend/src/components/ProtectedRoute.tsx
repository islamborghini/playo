/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const location = useLocation()

  console.log('🛡️ ProtectedRoute Check:', {
    path: location.pathname,
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    timestamp: new Date().toISOString()
  })

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Still loading auth state...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-6xl">⚔️</div>
          <p className="mt-4 text-slate-400">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to /login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ ProtectedRoute: Authenticated, rendering protected content')
  return <>{children}</>
}

export default ProtectedRoute
