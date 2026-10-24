import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { clearCurrentUser, authHeaders } from '../auth'
import { statusLabel, docTypeLabel } from '../documents'

type Stats = {
  landowners: number
  growers: number
  total: number
}

type UserRow = {
  id: number
  name: string
  email: string
  phone: string
  role: string
  document_status: string
  document_type: string | null
}

type Filter = 'all' | 'landowner' | 'grower'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Both admin endpoints need the token in the Authorization header
        const [statsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/stats`, { headers: authHeaders() }),
          fetch(`${API_URL}/admin/users`, { headers: authHeaders() }),
        ])
        if (statsRes.status === 401 || usersRes.status === 401) {
          // Token expired or invalid: log in again
          clearCurrentUser()
          navigate('/login')
          return
        }
        if (!statsRes.ok || !usersRes.ok) {
          setError('Could not load data from the server')
          return
        }
        setStats(await statsRes.json())
        setUsers(await usersRes.json())
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }

    loadData()
  }, [navigate])

  // Open the document in a new tab. A plain link can't send the token header,
  // so we fetch the file ourselves and show it from a temporary browser URL.
  const viewDocument = async (userId: number) => {
    setError('')
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/document`, { headers: authHeaders() })
      if (!response.ok) {
        setError('Could not open the document')
        return
      }
      window.open(URL.createObjectURL(await response.blob()), '_blank')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    }
  }

  const reviewDocument = async (userId: number, decision: 'approved' | 'rejected') => {
    setError('')
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/document`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ decision }),
      })
      if (!response.ok) {
        setError('Could not save the decision')
        return
      }
      const updated: UserRow = await response.json()
      // Swap the updated user into the list, so the queue and the table both refresh
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)))
    } catch {
      setError('Could not reach the server. Is the backend running?')
    }
  }

  const pendingDocuments = users.filter((u) => u.document_status === 'pending')

  const handleLogout = () => {
    clearCurrentUser()
    navigate('/login')
  }

  const visibleUsers = users.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false
    const q = search.trim().toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'landowner', label: 'Landowners' },
    { value: 'grower', label: 'Growers' },
  ]

  const cards = stats
    ? [
        { label: 'Landowners', value: stats.landowners },
        { label: 'Growers', value: stats.growers },
        { label: 'Total users', value: stats.total },
      ]
    : []

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-display text-xl text-sand">FarmConnect Admin</span>
          <button
            onClick={handleLogout}
            className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="font-display text-4xl font-semibold text-forest">Dashboard</h1>
        <p className="font-body text-forest/70 mt-2">Live counts from the FarmConnect database.</p>

        {error && <p className="font-body text-red-700 mt-8">{error}</p>}

        {!stats && !error && <p className="font-body text-forest/70 mt-8">Loading...</p>}

        <div className="grid grid-cols-3 gap-8 mt-10">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl border border-forest/10 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-forest/10 hover:-translate-y-1"
            >
              <p className="font-body text-sm text-forest/60">{c.label}</p>
              <p className="font-display text-5xl font-semibold text-marigold mt-2">{c.value}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold text-forest mt-16">Documents to review</h2>
        <div className="mt-4 bg-white rounded-2xl border border-forest/10">
          {stats && pendingDocuments.length === 0 && (
            <p className="font-body text-sm text-forest/60 px-6 py-5">No documents are waiting for review.</p>
          )}
          {pendingDocuments.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-forest/10 last:border-b-0"
            >
              <div className="mr-auto font-body">
                <p className="text-forest font-semibold">{u.name}</p>
                <p className="text-sm text-forest/60 capitalize">
                  {u.role} &middot; {docTypeLabel(u.document_type)}
                </p>
              </div>
              <button
                onClick={() => viewDocument(u.id)}
                className="px-4 py-2 rounded-full border border-forest/30 text-forest font-body text-sm hover:bg-forest/5"
              >
                View
              </button>
              <button
                onClick={() => reviewDocument(u.id, 'approved')}
                className="px-4 py-2 rounded-full bg-forest text-sand font-body text-sm hover:bg-forest/90"
              >
                Approve
              </button>
              <button
                onClick={() => reviewDocument(u.id, 'rejected')}
                className="px-4 py-2 rounded-full border border-red-300 text-red-700 font-body text-sm hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold text-forest mt-16">Users</h2>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-5 py-2 rounded-full font-body text-sm border transition-colors ${
                filter === f.value
                  ? 'bg-forest text-sand border-forest'
                  : 'text-forest border-forest/30 hover:bg-forest/5'
              }`}
            >
              {f.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto px-4 py-2 rounded-lg border border-forest/20 font-body text-sm text-forest focus:outline-none focus:border-marigold"
          />
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-forest/10 overflow-hidden">
          <table className="w-full font-body text-sm text-left">
            <thead className="bg-forest/5 text-forest/70">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Documents</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id} className="border-t border-forest/10 text-forest">
                  <td className="px-5 py-3">{u.id}</td>
                  <td className="px-5 py-3">{u.name}</td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">{u.phone}</td>
                  <td className="px-5 py-3 capitalize">{u.role}</td>
                  <td className="px-5 py-3">{statusLabel(u.document_status)}</td>
                </tr>
              ))}
              {stats && visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-forest/60">
                    No users match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="font-body text-sm text-forest/60 mt-3">
          Showing {visibleUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard