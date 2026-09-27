import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating.jsx'

export default function HotelCard({ hotel, wide = false }) {
  const navigate = useNavigate()
  const go = () => navigate(`/hotel/${hotel.id}`)

  return (
    <article className={`card ${wide ? 'card-wide' : ''}`} onClick={go}>
      <div className="card-img">
        <img src={hotel.image} alt={hotel.name} loading="lazy" />
        <span className="card-badge">★ {hotel.rating}</span>
      </div>
      <div className="card-body">
        <div className="card-loc">📍 {hotel.city}, {hotel.country}</div>
        <div className="card-title">{hotel.name}</div>
        <StarRating stars={hotel.stars} />
        {wide && <p className="card-desc">{hotel.description}</p>}
        {wide && (
          <div className="amenities">
            {hotel.amenities.slice(0, 5).map((a) => (
              <span className="chip" key={a}>{a}</span>
            ))}
          </div>
        )}
        <div className="card-foot">
          <div className="rating">
            <span className="badge">{hotel.rating}</span>
            <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
              ({hotel.reviews.toLocaleString()})
            </span>
          </div>
          <div className="price">
            ${hotel.pricePerNight}<span>/night</span>
          </div>
        </div>
      </div>
    </article>
  )
}
