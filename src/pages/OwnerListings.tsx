import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const owner = { name: 'Nasteho Farah', email: 'nasteha1@gmail.com' }

const listings = [
  {
    id: 1,
    photo:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrZKxheZ56xmOzoyd0wM5H3RNuCWV2UuckUtGuZQs1Bw&s=10',
    title: 'Established backyard vegetable plot',
    location: 'Nairobi County',
    size: '0.5 acres',
    price: 'KSh 10,000 / month',
    priceType: 'Fixed price',
    availability: '1 Nov 2026 to 1 Feb 2027',
    status: 'Available',
  },
  {
    id: 2,
    photo:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbhf-0AdnYZZKwiHbC4Ap2UnHb9wSN8clPT60qqq9pNw&s=10',
    title: 'Productive vegetable plot with greenhouse',
    location: 'Nairobi County',
    size: '0.25 acres',
    price: '20% of harvest',
    priceType: 'Harvest share',
    availability: '1 Dec 2026 to 1 Mar 2027',
    status: 'Reserved',
  },
]

function OwnerListings() {
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('ownerLoggedIn') !== 'true') {
      navigate('/owner/login')
    }
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('ownerLoggedIn')
    navigate('/owner/login')
  }

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-[family-name:--font-display] text-xl text-sand">
            FarmConnect
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
          Your listings
        </h1>
        <p className="font-[family-name:--font-body] text-forest/70 mt-2">
          Signed in as {owner.name} ({owner.email})
        </p>
        

        <div className="grid grid-cols-2 gap-8 mt-10">
          {listings.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-2xl border border-forest/10 overflow-hidden"
            >
              <img
                src={l.photo}
                alt="Sample land listing"
                className="w-full h-56 object-cover"
              />
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-[family-name:--font-display] text-2xl font-semibold text-forest">
                    {l.title}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-[family-name:--font-body] font-semibold ${
                      l.status === 'Available'
                        ? 'bg-forest/10 text-forest'
                        : 'bg-marigold/20 text-forest'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                <p className="font-[family-name:--font-body] text-forest/70">{l.location}</p>
                <div className="grid grid-cols-2 gap-4 font-[family-name:--font-body] text-forest">
                  <div>
                    <p className="text-sm text-forest/60">Size</p>
                    <p className="font-semibold">{l.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-forest/60">{l.priceType}</p>
                    <p className="font-semibold">{l.price}</p>
                  </div>
                </div>
                <div className="font-[family-name:--font-body] text-forest">
                  <p className="text-sm text-forest/60">Available</p>
                  <p className="font-semibold">{l.availability}</p>
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