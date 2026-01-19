import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@/domain/auth/hooks/useAuth'
import { authService } from '@/domain/auth/services/auth.service'
import { FullPageSpinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useUser()
  const location = useLocation()

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// admin only
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
}

// any authenticated user
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

// redirect authenticated users
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser()

  if (isLoading && authService.isAuthenticated()) {
    return <FullPageSpinner />
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
