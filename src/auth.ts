export type Role = 'landowner' | 'grower' | 'admin'

export type CurrentUser = {
  id: number
  name: string
  email: string
  role: Role
  token: string
}

const KEY = 'currentUser'
const ROLES: Role[] = ['landowner', 'grower', 'admin']

export function saveCurrentUser(user: CurrentUser) {
  sessionStorage.setItem(KEY, JSON.stringify(user))
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const saved = sessionStorage.getItem(KEY)
    if (!saved) return null
    const user = JSON.parse(saved)
    if (typeof user.id !== 'number' || !ROLES.includes(user.role)) return null
    // Sessions saved before tokens existed have no token, so make them log in again
    if (typeof user.token !== 'string' || !user.token) return null
    return user as CurrentUser
  } catch {
    return null
  }
}

export function clearCurrentUser() {
  sessionStorage.removeItem(KEY)
}

// The header that proves who we are on protected API calls
export function authHeaders(): Record<string, string> {
  const user = getCurrentUser()
  return user ? { Authorization: `Bearer ${user.token}` } : {}
}

// Where each role lands after login
export function homeForRole(role: Role): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'grower') return '/grower/browse'
  return '/owner/listings'
}