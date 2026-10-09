import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Stats = {
  landowners: number
  growers: number
  total: number
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // 1. Only let someone in who has logged in through the admin login page
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
      navigate('/admin/login')
      return
    }

    // 2. Ask the backend for the real counts from PostgreSQL
    const loadStats = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/admin/stats')
        if (!response.ok) {
          setError('Could not load stats from the server')
          return
        }
        const data = await response.json()
        setStats(data)
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }

    loadStats()
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn')
    navigate('/admin/login')
  }

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
          <span className="font-[family-name:--font-display] text-xl text-sand">
            FarmConnect Admin
          </span>
          <button
            onClick={handleLogout}
            className="px-5 py-2 text-sand border border-sand/40 rounded-full font-[family-name:--font-body] transition-colors hover:bg-sand/10"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="font-[family-name:--font-display] text-4xl font-semibold text-forest">
          Dashboard
        </h1>
        <p className="font-[family-name:--font-body] text-forest/70 mt-2">
          Live counts from the FarmConnect database.
        </p>

        {error && (
          <p className="font-[family-name:--font-body] text-red-700 mt-8">{error}</p>
        )}

        {!stats && !error && (
          <p className="font-[family-name:--font-body] text-forest/70 mt-8">Loading...</p>
        )}

        <div className="grid grid-cols-3 gap-8 mt-10">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl border border-forest/10 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-forest/10 hover:-translate-y-1"
            >
              <p className="font-[family-name:--font-body] text-sm text-forest/60">{c.label}</p>
              <p className="font-[family-name:--font-display] text-5xl font-semibold text-marigold mt-2">
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard