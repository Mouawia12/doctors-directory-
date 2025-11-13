import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthQuery } from '@/features/auth/hooks'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: string[]
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { data: user, status } = useAuthQuery()
  const location = useLocation()

  if (status === 'pending') {
    return <div className="grid min-h-[50vh] place-items-center text-slate-500">جارٍ التحقق من الصلاحيات...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/" replace />
  }

  return children
}
