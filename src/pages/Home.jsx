import { useEffect } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import { hotels } from '../data/hotels'
import { trackPageView } from '../analytics/track'

export default function Home() {
  useEffect(() => {
    trackPageView('home')
  }, [])

  const featured = hotels.slice(0, 8)

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find your next stay</h1>
          <p>Search deals on hotels, resorts and villas across the world.</p>
        </div>
      </section>

      <div className="container search-wrap">
        <SearchBar />
      </div>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Featured stays</h2>
            <p>Hand-picked hotels loved by TripNest travellers</p>
          </div>
        </div>
        <div className="grid">
          {featured.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      </section>
    </>
  )
}
