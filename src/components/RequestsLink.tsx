import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'
import { authHeaders } from '../auth'

// The "Requests" button in the navbar, with a number on it when something is new.
function RequestsLink() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications`, { headers: authHeaders() })
        if (!response.ok) return // a badge must never break the page
        const all: { is_read: boolean }[] = await response.json()
        setUnread(all.filter((n) => !n.is_read).length)
      } catch {
        // backend unreachable: just show no number
      }
    }

    load()
    const timer = setInterval(load, 30000) // check again every 30 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <Link
      to="/requests"
      className="relative px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
    >
      Requests
      {unread > 0 && (
        <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-marigold text-forest text-xs font-bold flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}

export default RequestsLink