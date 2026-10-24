import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { getCurrentUser } from '../auth'
import RequestPlotForm from '../components/RequestPlotForm'
import RequestsLink from '../components/RequestsLink'

type PriceType = 'fixed' | 'negotiable' | 'harvest_share'

type Detail = {
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
  status: string
  owner_name: string
  owner_document_status: string
}

function formatPrice(l: Detail) {
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
    month: 'long',
    year: 'numeric',
  })
}

function ListingDetail() {
  const { id } = useParams() // the number in /grower/listings/:id
  const [grower] = useState(getCurrentUser)
  const [listing, setListing] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [sentRequest, setSentRequest] = useState<{ start: string; end: string } | null>(null)

  useEffect(() => {
    const loadListing = async () => {
      try {
        const response = await fetch(`${API_URL}/listings/${id}`)
        if (response.status === 404) {
          setError('This listing does not exist.')
          return
        }
        if (!response.ok) {
          setError('Could not load this listing.')
          return
        }
        setListing(await response.json())
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }
    loadListing()
  }, [id])

  if (!grower) return null

  const reviewed = listing?.owner_document_status === 'approved'

  const fact = (label: string, value: string | null) => (
    <div className="bg-white rounded-xl border border-forest/10 p-5">
      <p className="font-body text-sm text-forest/60">{label}</p>
      <p className="font-body font-semibold text-forest mt-1">{value ?? 'Not specified'}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-display text-xl text-sand">FarmConnect</span>
          <div className="flex items-center gap-3">
            <RequestsLink />
            <Link
              to="/grower/browse"
              className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
            >
              Back to listings
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {error && (
          <div>
            <p className="font-body text-red-700">{error}</p>
            <Link to="/grower/browse" className="font-body text-forest font-semibold underline">
              Back to listings
            </Link>
          </div>
        )}

        {!listing && !error && <p className="font-body text-forest/70">Loading...</p>}

        {listing && !sentRequest && (
          <>
            <img
              src={listing.photo_url}
              alt={listing.title}
              className="w-full h-96 object-cover rounded-2xl bg-forest/10"
            />

            <div className="flex items-start justify-between gap-4 mt-8">
              <div>
                <h1 className="font-display text-4xl font-semibold text-forest">{listing.title}</h1>
                <p className="font-body text-lg text-forest/70 mt-1">{listing.location_name}</p>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-sm font-body font-semibold ${
                  listing.status === 'available' ? 'bg-forest/10 text-forest' : 'bg-marigold/20 text-forest'
                }`}
              >
                {listing.status === 'available' ? 'Available' : 'Reserved'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {fact('Size', `${listing.size_acres} acres`)}
              {fact(priceLabel(listing.price_type), formatPrice(listing))}
              {fact(
                'Available',
                `${formatDate(listing.availability_start)} to ${formatDate(listing.availability_end)}`,
              )}
            </div>

            {listing.description && (
              <div className="mt-8">
                <h2 className="font-display text-2xl font-semibold text-forest">About this land</h2>
                <p className="font-body text-forest/80 mt-2 leading-relaxed">{listing.description}</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-display text-2xl font-semibold text-forest">Growing conditions</h2>
              <div className="grid grid-cols-3 gap-4 mt-3">
                {fact('Water', listing.water_availability)}
                {fact('Sunlight', listing.sunlight)}
                {fact('Soil', listing.soil_info)}
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-forest/10 p-6">
              <p className="font-body text-sm text-forest/60">Listed by</p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <p className="font-display text-2xl font-semibold text-forest">{listing.owner_name}</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
                    reviewed ? 'bg-forest/10 text-forest' : 'bg-forest/5 text-forest/70'
                  }`}
                >
                  {reviewed ? 'Document reviewed' : 'Document not yet reviewed'}
                </span>
              </div>
              <p className="font-body text-sm text-forest/60 mt-3">
                FarmConnect reviews the documents landowners submit. It does not verify legal ownership of land.
              </p>
            </div>

            {listing.status === 'available' && (
              <RequestPlotForm
                listingId={listing.id}
                availableFrom={listing.availability_start}
                availableTo={listing.availability_end}
                onSent={(start, end) => {
                  setSentRequest({ start, end })
                  window.scrollTo({ top: 0 })
                }}
              />
            )}
          </>
        )}

        {listing && sentRequest && (
          <div className="bg-white rounded-2xl border border-forest/10 p-12 text-center max-w-xl mx-auto mt-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-forest flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-sand" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-4xl font-semibold text-forest mt-6">Request sent</h1>
            <p className="font-body text-forest/80 mt-3">
              {listing.owner_name} will accept or decline your request for{' '}
              <span className="font-semibold">{listing.title}</span>, from {formatDate(sentRequest.start)} to{' '}
              {formatDate(sentRequest.end)}.
            </p>
            <p className="font-body text-forest/60 mt-2">You can leave this page.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                to="/requests"
                className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90"
              >
                View my requests
              </Link>
              <Link
                to="/grower/browse"
                className="px-6 py-3 border border-forest/30 text-forest rounded-full font-body font-semibold transition-colors hover:bg-forest/5"
              >
                Back to listings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListingDetail