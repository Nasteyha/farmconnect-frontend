import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { getCurrentUser } from '../auth'

type PriceType = 'fixed' | 'negotiable' | 'harvest_share'

// FastAPI sends either a plain string or a list of validation problems
function readError(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0] && typeof detail[0].msg === 'string') {
    return detail[0].msg.replace(/^Value error, /, '')
  }
  return 'Some details were not accepted. Please check them and try again.'
}

function AddListing() {
  const navigate = useNavigate()
  const [owner] = useState(getCurrentUser)

  const [title, setTitle] = useState('')
  const [locationName, setLocationName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('-1.2921')
  const [lng, setLng] = useState('36.8219')
  const [size, setSize] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [water, setWater] = useState('')
  const [sunlight, setSunlight] = useState('')
  const [soil, setSoil] = useState('')
  const [priceType, setPriceType] = useState<PriceType>('fixed')
  const [priceValue, setPriceValue] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!owner) return null

  const isShare = priceType === 'harvest_share'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const sizeNum = Number(size)
    const priceNum = Number(priceValue)
    const latNum = Number(lat)
    const lngNum = Number(lng)

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    if (locationName.trim().length < 2) {
      setError('Please enter the area where the land is')
      return
    }
    if (lat.trim() === '' || lng.trim() === '' || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError('Latitude and longitude must be numbers')
      return
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setError('Latitude must be between -90 and 90, and longitude between -180 and 180')
      return
    }
    if (!(sizeNum > 0)) {
      setError('Size must be greater than 0 acres')
      return
    }
    if (!/^https?:\/\/\S+$/.test(photoUrl.trim())) {
      setError('Photo must be a web link starting with http:// or https://')
      return
    }
    if (!(priceNum > 0)) {
      setError(isShare ? 'Harvest share must be greater than 0%' : 'Price must be greater than 0')
      return
    }
    if (isShare && priceNum > 100) {
      setError('Harvest share cannot be more than 100%')
      return
    }
    if (!start || !end) {
      setError('Please choose both availability dates')
      return
    }
    if (end <= start) {
      setError('The end date must be after the start date')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: owner.id,
          title: title.trim(),
          location_name: locationName.trim(),
          description: description.trim() || null,
          location_lat: latNum,
          location_lng: lngNum,
          size_acres: sizeNum,
          photo_url: photoUrl.trim(),
          water_availability: water.trim() || null,
          sunlight: sunlight.trim() || null,
          soil_info: soil.trim() || null,
          price_type: priceType,
          price_value: priceNum,
          availability_start: start,
          availability_end: end,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(readError(body.detail))
        return
      }

      navigate('/owner/listings')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-forest/20 font-body text-forest focus:outline-none focus:border-marigold'
  const labelClass = 'font-body text-sm font-semibold text-forest'

  const priceChoice = (type: PriceType, label: string) => (
    <button
      type="button"
      onClick={() => setPriceType(type)}
      className={`flex-1 px-3 py-3 rounded-xl border font-body text-sm font-semibold transition-colors ${
        priceType === type
          ? 'border-marigold bg-marigold/10 text-forest'
          : 'border-forest/20 text-forest/70 hover:border-forest/40'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-display text-xl text-sand">FarmConnect</span>
          <Link
            to="/owner/listings"
            className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
          >
            Back to listings
          </Link>
        </div>
      </nav>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-8 py-16 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-forest">Add a listing</h1>
          <p className="font-body text-forest/70 mt-2">Tell growers about your land.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunny backyard plot" />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Area</label>
          <input className={inputClass} value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Kilimani, Nairobi" />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Description (optional)</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Latitude</label>
            <input className={inputClass} value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Longitude</label>
            <input className={inputClass} value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
        </div>
        <p className="font-body text-sm text-forest/60 -mt-3">
          Pre-filled with central Nairobi. A map picker will replace these two fields.
        </p>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Size (acres)</label>
          <input className={inputClass} type="number" step="any" min="0" value={size} onChange={(e) => setSize(e.target.value)} placeholder="0.5" />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Photo link</label>
          <input className={inputClass} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
          {/^https?:\/\/\S+$/.test(photoUrl.trim()) && (
            <img src={photoUrl.trim()} alt="Preview" className="w-full h-40 object-cover rounded-lg bg-forest/10" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Water (optional)</label>
            <input className={inputClass} value={water} onChange={(e) => setWater(e.target.value)} placeholder="Borehole" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Sunlight (optional)</label>
            <input className={inputClass} value={sunlight} onChange={(e) => setSunlight(e.target.value)} placeholder="Full sun" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Soil (optional)</label>
            <input className={inputClass} value={soil} onChange={(e) => setSoil(e.target.value)} placeholder="Loamy" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Pricing</label>
          <div className="flex gap-3">
            {priceChoice('fixed', 'Fixed price')}
            {priceChoice('negotiable', 'Negotiable')}
            {priceChoice('harvest_share', 'Harvest share')}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {isShare ? 'Share of harvest (%)' : priceType === 'negotiable' ? 'Asking price (KSh per month)' : 'Price (KSh per month)'}
          </label>
          <input
            className={inputClass}
            type="number"
            step="any"
            min="0"
            max={isShare ? 100 : undefined}
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            placeholder={isShare ? '20' : '10000'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Available from</label>
            <input className={inputClass} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Available until</label>
            <input className={inputClass} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        {error && <p className="font-body text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Create listing'}
        </button>
      </form>
    </div>
  )
}

export default AddListing