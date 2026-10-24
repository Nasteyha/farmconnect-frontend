import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser, homeForRole } from '../auth'
import type { Role } from '../auth'

function RequireRole({ role, children }: { role: Role | Role[]; children: ReactNode }) {
  const user = getCurrentUser()

  if (!user) return <Navigate to="/login" replace />
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />

  return <>{children}</>
}

export default RequireRole