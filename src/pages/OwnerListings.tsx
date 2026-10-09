import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { getCurrentUser, clearCurrentUser } from '../auth'

type Listing = {
  id: number
  title: string
  location_name: string
  photo_url: string
  size_acres: number
  price_type: 'fixed' | 'negotiable' | 'harvest_share'
  price_value: number
  availability_start: string
  availability_end: string
  status: string
}

function formatPrice(l: Listing) {
  if (l.price_type === 'harvest_share') return `${l.price_value}% of harvest`
  return `KSh ${l.price_value.toLocaleString()} / month`
}

function priceLabel(type: Listing['price_type']) {
  if (type === 'fixed') return 'Fixed price'
  if (type === 'negotiable') return 'Negotiable'
  return 'Harvest share'
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function OwnerListings() {
  const navigate = useNavigate()
  const [owner] = useState(getCurrentUser)
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!owner) return

    const loadListings = async () => {
      try {
        const response = await fetch(`${API_URL}/listings?owner_id=${owner.id}`)
        if (!response.ok) {
          setError('Could not load your listings')
          return
        }
        setListings(await response.json())
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }

    loadListings()
  }, [owner])

  const handleLogout = () => {
    clearCurrentUser()
    navigate('/login')
  }

  if (!owner) return null

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-display text-xl text-sand">FarmConnect</span>
          <button
            onClick={handleLogout}
            className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold text-forest">Your listings</h1>
            <p className="font-body text-forest/70 mt-2">
              Signed in as {owner.name} ({owner.email})
            </p>
          </div>
          <Link
            to="/owner/listings/new"
            className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90"
          >
            Add listing
          </Link>
        </div>

        {error && <p className="font-body text-red-700 mt-8">{error}</p>}

        {!listings && !error && <p className="font-body text-forest/70 mt-8">Loading...</p>}

        {listings && listings.length === 0 && (
          <p className="font-body text-forest/70 mt-8">
            You have no listings yet.{' '}
            <Link to="/owner/listings/new" className="text-forest font-semibold underline">
              Add your first one
            </Link>
            .
          </p>
        )}

        <div className="grid grid-cols-2 gap-8 mt-10">
          {listings?.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-forest/10 overflow-hidden">
              <img src={l.photo_url} alt={l.title} className="w-full h-56 object-cover bg-forest/10" />
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-2xl font-semibold text-forest">{l.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
                      l.status === 'available' ? 'bg-forest/10 text-forest' : 'bg-marigold/20 text-forest'
                    }`}
                  >
                    {capitalise(l.status)}
                  </span>
                </div>
                <p className="font-body text-forest/70">{l.location_name}</p>
                <div className="grid grid-cols-2 gap-4 font-body text-forest">
                  <div>
                    <p className="text-sm text-forest/60">Size</p>
                    <p className="font-semibold">{l.size_acres} acres</p>
                  </div>
                  <div>
                    <p className="text-sm text-forest/60">{priceLabel(l.price_type)}</p>
                    <p className="font-semibold">{formatPrice(l)}</p>
                  </div>
                </div>
                <div className="font-body text-forest">
                  <p className="text-sm text-forest/60">Available</p>
                  <p className="font-semibold">
                    {formatDate(l.availability_start)} to {formatDate(l.availability_end)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OwnerListings