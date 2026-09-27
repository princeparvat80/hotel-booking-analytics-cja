import { useEffect } from 'react'
import HotelCard from '../components/HotelCard.jsx'
import { hotels } from '../data/hotels'
import { trackPageView } from '../analytics/track'

export default function Deals() {
  useEffect(() => {
    trackPageView('deals')
  }, [])

  // "Deals" = the most affordable stays, cheapest first.
  const deals = [...hotels].sort((a, b) => a.pricePerNight - b.pricePerNight).slice(0, 6)

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h2>🔥 Today's top deals</h2>
          <p>Limited-time prices on traveller favourites</p>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 8 }}>
        {deals.map((h) => (
          <HotelCard key={h.id} hotel={h} />
        ))}
      </div>
    </div>
  )
}
