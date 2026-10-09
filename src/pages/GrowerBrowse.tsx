import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { getCurrentUser, clearCurrentUser } from '../auth'

type PriceType = 'fixed' | 'negotiable' | 'harvest_share'

type Listing = {
  id: number
  title: string
  location_name: string
  description: string | null
  photo_url: string
  size_acres: number
  water_availability: string | null
  sunlight: string | null
  soil_info: string | null
  price_type: PriceType
  price_value: number
  availability_start: string
  availability_end: string
}

function formatPrice(l: Listing) {
  if (l.price_type === 'harvest_share') return `${l.price_value}% of harvest`
  return `KSh ${l.price_value.toLocaleString()} / month`
}

function priceLabel(type: PriceType) {
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

function GrowerBrowse() {
  const navigate = useNavigate()
  const [grower] = useState(getCurrentUser)
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | PriceType>('all')

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await fetch(`${API_URL}/listings?status=available`)
        if (!response.ok) {
          setError('Could not load listings')
          return
        }
        setListings(await response.json())
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }

    loadListings()
  }, [])

  const handleLogout = () => {
    clearCurrentUser()
    navigate('/login')
  }

  if (!grower) return null

  const term = search.trim().toLowerCase()
  const visible = (listings ?? []).filter((l) => {
    const matchesSearch =
      term === '' ||
      l.title.toLowerCase().includes(term) ||
      l.location_name.toLowerCase().includes(term)
    const matchesPrice = priceFilter === 'all' || l.price_type === priceFilter
    return matchesSearch && matchesPrice
  })

  const filterButton = (value: 'all' | PriceType, label: string) => (
    <button
      type="button"
      onClick={() => setPriceFilter(value)}
      className={`px-4 py-2 rounded-full border font-body text-sm font-semibold transition-colors ${
        priceFilter === value
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
          <button
            onClick={handleLogout}
            className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="font-display text-4xl font-semibold text-forest">Find land to grow</h1>
        <p className="font-body text-forest/70 mt-2">
          Signed in as {grower.name} ({grower.email})
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or area"
            className="px-4 py-2 rounded-full border border-forest/20 font-body text-forest focus:outline-none focus:border-marigold w-72"
          />
          {filterButton('all', 'All')}
          {filterButton('fixed', 'Fixed price')}
          {filterButton('negotiable', 'Negotiable')}
          {filterButton('harvest_share', 'Harvest share')}
        </div>

        {error && <p className="font-body text-red-700 mt-8">{error}</p>}

        {!listings && !error && <p className="font-body text-forest/70 mt-8">Loading...</p>}

        {listings && listings.length === 0 && (
          <p className="font-body text-forest/70 mt-8">
            No land is available right now. Check back soon.
          </p>
        )}

        {listings && listings.length > 0 && visible.length === 0 && (
          <p className="font-body text-forest/70 mt-8">No listings match your search.</p>
        )}

        <div className="grid grid-cols-2 gap-8 mt-10">
          {visible.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-forest/10 overflow-hidden">
              <img src={l.photo_url} alt={l.title} className="w-full h-56 object-cover bg-forest/10" />
              <div className="p-6 flex flex-col gap-3">
                <h2 className="font-display text-2xl font-semibold text-forest">{l.title}</h2>
                <p className="font-body text-forest/70">{l.location_name}</p>
                {l.description && <p className="font-body text-forest/80">{l.description}</p>}

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

                {(l.water_availability || l.sunlight || l.soil_info) && (
                  <div className="flex flex-wrap gap-2">
                    {l.water_availability && (
                      <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-sm font-body">
                        Water: {l.water_availability}
                      </span>
                    )}
                    {l.sunlight && (
                      <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-sm font-body">
                        Sun: {l.sunlight}
                      </span>
                    )}
                    {l.soil_info && (
                      <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-sm font-body">
                        Soil: {l.soil_info}
                      </span>
                    )}
                  </div>
                )}

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

export default GrowerBrowse