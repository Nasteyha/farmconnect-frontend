import { useState } from 'react'
import { API_URL } from '../config'
import { authHeaders } from '../auth'

type Props = {
  listingId: number
  availableFrom: string // "2026-11-01", the listing's own window
  availableTo: string
  onSent: (start: string, end: string) => void // tells the page the request went through
}

function RequestPlotForm({ listingId, availableFrom, availableTo, onSent }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-forest/20 font-body text-forest focus:outline-none focus:border-marigold'
  const labelClass = 'font-body text-sm font-semibold text-forest'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!startDate || !endDate) {
      setError('Please choose a start and an end date.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          listing_id: listingId,
          start_date: startDate,
          end_date: endDate,
          message: message.trim() || null,
        }),
      })

      if (response.ok) {
        onSent(startDate, endDate)
        return
      }

      if (response.status === 401) {
        setError('Your session has expired. Please log in again.')
        return
      }

      // The backend's own reason ("dates outside the window", "already pending"...)
      // comes back as a plain string for 400/403 errors, and as a list for 422 errors.
      const data = await response.json().catch(() => null)
      setError(typeof data?.detail === 'string' ? data.detail : 'Please check the dates you entered.')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-2xl border border-forest/10 p-6 flex flex-col gap-5">
      <h2 className="font-display text-2xl font-semibold text-forest">Request this plot</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className={labelClass}>From</label>
          <input
            type="date"
            className={inputClass}
            value={startDate}
            min={availableFrom}
            max={availableTo}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClass}>To</label>
          <input
            type="date"
            className={inputClass}
            value={endDate}
            min={availableFrom}
            max={availableTo}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass}>Message to the landowner (optional)</label>
        <textarea
          className={inputClass}
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What would you like to grow?"
        />
      </div>

      {error && <p className="font-body text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90 disabled:opacity-60 self-start"
      >
        {loading ? 'Sending...' : 'Send request'}
      </button>
    </form>
  )
}

export default RequestPlotForm