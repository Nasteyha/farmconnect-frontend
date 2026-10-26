import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { divIcon, latLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'

type MapListing = {
  id: number
  title: string
  location_name: string
  price_type: 'fixed' | 'negotiable' | 'harvest_share'
  price_value: number
  location_lat: number
  location_lng: number
}

type Props = {
  listings: MapListing[]
}

// Centre of Nairobi, used when there are no listings to show
const NAIROBI: [number, number] = [-1.286, 36.82]

// A simple round marigold pin, drawn with CSS so we do not need image files
const pin = divIcon({
  className: '',
  html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#D9A441;border:3px solid #1F3B2C;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
})

function priceText(l: MapListing) {
  if (l.price_type === 'harvest_share') return `${l.price_value}% of harvest`
  return `KSh ${l.price_value.toLocaleString()} / month`
}

// Zooms the map so that every visible listing is on screen
function FitToListings({ listings }: Props) {
  const map = useMap()

  useEffect(() => {
    if (listings.length === 0) return
    const points = listings.map((l) => [l.location_lat, l.location_lng] as [number, number])
    map.fitBounds(latLngBounds(points), { padding: [50, 50], maxZoom: 14 })
  }, [listings, map])

  return null
}

function ListingsMap({ listings }: Props) {
  return (
    <div className="isolate h-[560px] rounded-2xl overflow-hidden border border-forest/10 mt-10">
      <MapContainer center={NAIROBI} zoom={11} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToListings listings={listings} />
        {listings.map((l) => (
          <Marker key={l.id} position={[l.location_lat, l.location_lng]} icon={pin}>
            <Popup>
              <div className="font-body text-forest">
                <p className="font-semibold">{l.title}</p>
                <p className="text-sm">{l.location_name}</p>
                <p className="text-sm mt-1">{priceText(l)}</p>
                <Link to={`/grower/listings/${l.id}`} className="text-sm font-semibold underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default ListingsMap