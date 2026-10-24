import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { getCurrentUser, clearCurrentUser, authHeaders } from '../auth'

type Booking = {
  id: number
  listing_id: number
  listing_title: string
  grower_id: number
  grower_name: string
  start_date: string
  end_date: string
  message: string | null
  status: string // pending / accepted / declined
}

type Decision = 'accepted' | 'declined'

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function statusLabel(status: string, isOwner: boolean) {
  if (status === 'pending') return isOwner ? 'Needs your answer' : 'Waiting for the landowner'
  if (status === 'accepted') return 'Accepted'
  if (status === 'declined') return 'Declined'
  return status
}

function Requests() {
  const navigate = useNavigate()
  const [user] = useState(getCurrentUser)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState('')
  // which request the owner is about to answer, so we can ask "are you sure?" first
  const [confirming, setConfirming] = useState<{ id: number; decision: Decision } | null>(null)
  const [busy, setBusy] = useState(false)

  const isOwner = user?.role === 'landowner'

  // Changing this number makes the effect below run again, which reloads the list
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await fetch(`${API_URL}/bookings`, { headers: authHeaders() })
        if (response.status === 401) {
          clearCurrentUser()
          navigate('/login')
          return
        }
        if (!response.ok) {
          setError('Could not load requests.')
          return
        }
        setBookings(await response.json())
        fetch(`${API_URL}/notifications/read`, { method: 'PUT', headers: authHeaders() }).catch(() => {})
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }
    loadBookings()
  }, [reloadKey, navigate])

  const handleDecision = async (id: number, decision: Decision) => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/bookings/${id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ decision }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(typeof data?.detail === 'string' ? data.detail : 'Could not save your answer.')
      }
      setConfirming(null)
      // reload either way: accepting also declines other requests for the same plot
      setReloadKey((k) => k + 1)
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = () => {
    clearCurrentUser()
    navigate('/login')
  }

  if (!user) return null

  const home = isOwner ? '/owner/listings' : '/grower/browse'

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-display text-xl text-sand">FarmConnect</span>
          <div className="flex items-center gap-3">
            <Link
              to={home}
              className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
            >
              {isOwner ? 'My listings' : 'Browse land'}
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="font-display text-4xl font-semibold text-forest">
          {isOwner ? 'Requests for your land' : 'My requests'}
        </h1>
        <p className="font-body text-forest/70 mt-2">
          {isOwner
            ? 'Growers who want to use your plots. Accepting a request reserves the plot.'
            : 'The plots you have asked to use, and what the landowners answered.'}
        </p>

        {error && <p className="font-body text-red-700 mt-6">{error}</p>}

        {!bookings && !error && <p className="font-body text-forest/70 mt-8">Loading...</p>}

        {bookings && bookings.length === 0 && (
          <p className="font-body text-forest/70 mt-8">
            {isOwner ? 'No one has asked for your land yet.' : 'You have not requested any plots yet.'}
          </p>
        )}

        <div className="flex flex-col gap-5 mt-8">
          {(bookings ?? []).map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-forest/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-forest">{b.listing_title}</h2>
                  <p className="font-body text-forest/70 mt-1">
                    {isOwner ? `Requested by ${b.grower_name}` : 'Your request'}
                  </p>
                </div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-body font-semibold whitespace-nowrap ${
                    b.status === 'accepted'
                      ? 'bg-forest text-sand'
                      : b.status === 'pending'
                        ? 'bg-marigold/20 text-forest'
                        : 'bg-forest/10 text-forest/70'
                  }`}
                >
                  {statusLabel(b.status, isOwner)}
                </span>
              </div>

              <p className="font-body text-forest mt-4">
                <span className="text-forest/60">Dates: </span>
                <span className="font-semibold">
                  {formatDate(b.start_date)} to {formatDate(b.end_date)}
                </span>
              </p>

              {b.message && <p className="font-body text-forest/80 mt-2 italic">"{b.message}"</p>}

              {isOwner && b.status === 'pending' && (
                <div className="mt-5">
                  {confirming?.id === b.id ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-body text-forest">
                        {confirming.decision === 'accepted'
                          ? 'Accept? The plot becomes reserved and other waiting requests are declined.'
                          : 'Decline this request?'}
                      </p>
                      <button
                        disabled={busy}
                        onClick={() => handleDecision(b.id, confirming.decision)}
                        className="px-5 py-2 bg-forest text-sand rounded-full font-body font-semibold disabled:opacity-60"
                      >
                        {busy ? 'Saving...' : 'Yes'}
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => setConfirming(null)}
                        className="px-5 py-2 border border-forest/30 text-forest rounded-full font-body font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirming({ id: b.id, decision: 'accepted' })}
                        className="px-5 py-2 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setConfirming({ id: b.id, decision: 'declined' })}
                        className="px-5 py-2 border border-forest/30 text-forest rounded-full font-body font-semibold transition-colors hover:bg-forest/5"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Requests