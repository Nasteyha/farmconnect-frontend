import { useState } from 'react'
import { API_URL } from '../config'
import { authHeaders } from '../auth'

type Props = {
  listingId: number
}

type Crop = {
  name: string | null // the part before the colon, for example "Kale"
  reason: string
}

// The model writes one crop per line. Clean each line up and split "Crop: reason".
function parseCrops(text: string): Crop[] {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/[*#_`]/g, '') // markdown symbols
        .replace(/^\s*(?:[-•]|\d+[.)])\s*/, '') // list bullets and numbers
        .trim(),
    )
    .filter((line) => line !== '')
    .map((line) => {
      const colon = line.indexOf(':')
      if (colon > 0 && colon < 40) {
        return { name: line.slice(0, colon).trim(), reason: line.slice(colon + 1).trim() }
      }
      return { name: null, reason: line }
    })
}

function CropAssistant({ listingId }: Props) {
  const [open, setOpen] = useState(false)
  const [asked, setAsked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [crops, setCrops] = useState<Crop[]>([])
  const [error, setError] = useState('')

  const ask = async () => {
    setAsked(true)
    setLoading(true)
    setError('')
    setCrops([])
    try {
      const response = await fetch(`${API_URL}/listings/${listingId}/crop-assistant`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(typeof data?.detail === 'string' ? data.detail : 'Something went wrong. Please try again.')
        return
      }
      setCrops(parseCrops(data.suggestions))
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full bg-forest text-sand font-body font-semibold shadow-xl transition-transform hover:scale-105"
      >
        What can I grow here?
      </button>
    )
  }

  const bubble = 'rounded-2xl px-4 py-3 font-body text-sm text-forest'

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] max-h-[75vh] flex flex-col bg-white rounded-2xl border border-forest/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between bg-forest px-5 py-4">
        <span className="font-display text-lg text-sand">Crop helper</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close crop helper"
          className="text-sand/80 hover:text-sand text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className={`${bubble} bg-sand self-start max-w-[90%]`}>
          Hi! I can suggest what you could grow on this plot. I look at its sunlight, water, soil and
          available dates, and the next 7 days of weather.
        </div>

        {asked && (
          <div className={`${bubble} bg-forest text-sand self-end`}>What can I grow here?</div>
        )}

        {loading && <div className={`${bubble} bg-sand self-start`}>Checking the weather...</div>}

        {error && <div className={`${bubble} bg-red-50 text-red-700 self-start max-w-[90%]`}>{error}</div>}

        {crops.length > 0 && (
          <div className={`${bubble} bg-sand self-start max-w-[95%]`}>
            <p className="font-semibold">Here is what could do well:</p>
            <ul className="mt-2 flex flex-col gap-2">
              {crops.map((crop, index) => (
                <li key={index}>
                  {crop.name && <span className="font-semibold">{crop.name}: </span>}
                  {crop.reason}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-forest/60">
              AI-assisted guidance, not a guarantee. Check with a local agronomist before you plant.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-forest/10 p-4">
        <button
          type="button"
          onClick={ask}
          disabled={loading}
          className="w-full px-4 py-3 rounded-full border border-forest/30 font-body font-semibold text-forest transition-colors hover:bg-forest/5 disabled:opacity-50"
        >
          {asked ? 'Ask again' : 'What can I grow here?'}
        </button>
      </div>
    </div>
  )
}

export default CropAssistant