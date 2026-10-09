export type Role = 'landowner' | 'grower' | 'admin'

export type CurrentUser = {
  id: number
  name: string
  email: string
  role: Role
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
    return user as CurrentUser
  } catch {
    return null
  }
}

export function clearCurrentUser() {
  sessionStorage.removeItem(KEY)
}

// Where each role lands after login
export function homeForRole(role: Role): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'grower') return '/grower/browse'
  return '/owner/listings'
}