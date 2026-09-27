import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { findHotel } from '../data/hotels'
import StarRating from '../components/StarRating.jsx'
import SignInModal from '../components/SignInModal.jsx'
import { trackHotelView, trackBookingStart } from '../analytics/track'
import { getUser } from '../analytics/session'

function nightsBetween(a, b) {
  const ms = new Date(b) - new Date(a)
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hotel = findHotel(id)

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10)

  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [roomType, setRoomType] = useState(hotel?.roomTypes?.[0] || '')
  const [tripType, setTripType] = useState('leisure')
  const [ratePlan, setRatePlan] = useState('Best Flexible Rate')
  const [boardType, setBoardType] = useState('Breakfast included')
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (hotel) trackHotelView(hotel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const total = hotel ? hotel.pricePerNight * nights * rooms : 0

  if (!hotel) {
    return (
      <div className="container section">
        <h2>Hotel not found</h2>
        <button className="btn btn-brand" onClick={() => navigate('/search')}>
          Back to search
        </button>
      </div>
    )
  }

  const proceedBooking = () => {
    const details = {
      roomType, ratePlan, boardType, tripType,
      checkInDate: checkIn, checkOutDate: checkOut,
      nights, guests: Number(guests), rooms: Number(rooms), totalValue: total,
      cancellationPolicy: ratePlan.includes('Non-refundable') ? 'non-refundable' : 'free-24h',
    }
    trackBookingStart(hotel, details)
    navigate(`/checkout/${hotel.id}`, { state: { details } })
  }

  // Booking requires the user to be signed in. If not, prompt sign-in and
  // continue to checkout automatically once they log in.
  const book = () => {
    if (!getUser()) {
      setShowSignIn(true)
      return
    }
    proceedBooking()
  }

  return (
    <div className="container section">
      <div className="detail-hero">
        <img src={hotel.image} alt={hotel.name} />
      </div>

      <div className="detail-grid">
        <div>
          <h1 className="detail-title">{hotel.name}</h1>
          <div className="detail-loc">
            📍 {hotel.city}, {hotel.country} &nbsp;•&nbsp; <StarRating stars={hotel.stars} />
            &nbsp;•&nbsp; ★ {hotel.rating} ({hotel.reviews.toLocaleString()} reviews)
          </div>

          <div className="detail-block">
            <h3>About this stay</h3>
            <p style={{ color: 'var(--muted)' }}>{hotel.description}</p>
          </div>

          <div className="detail-block">
            <h3>Amenities</h3>
            <div className="amenity-grid">
              {hotel.amenities.map((a) => (
                <div key={a}>✓ {a}</div>
              ))}
            </div>
          </div>

          <div className="detail-block">
            <h3>Room types</h3>
            <div className="amenities">
              {hotel.roomTypes.map((r) => (
                <span className="chip" key={r}>{r}</span>
              ))}
            </div>
          </div>

        </div>

        <aside className="booking-box">
          <div className="price">${hotel.pricePerNight}<span style={{fontSize:14,color:'var(--muted)'}}>/night</span></div>

          <div className="field">
            <label>Room type</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              {hotel.roomTypes.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Rate plan</label>
            <select value={ratePlan} onChange={(e) => setRatePlan(e.target.value)}>
              <option>Best Flexible Rate</option>
              <option>Non-refundable (save 10%)</option>
              <option>Member Rate</option>
            </select>
          </div>
          <div className="field">
            <label>Board</label>
            <select value={boardType} onChange={(e) => setBoardType(e.target.value)}>
              <option>Room only</option>
              <option>Breakfast included</option>
              <option>Half board</option>
              <option>Full board</option>
            </select>
          </div>
          <div className="field">
            <label>Trip type</label>
            <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
              <option value="leisure">Leisure</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div className="field">
            <label>Check-in</label>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="field">
            <label>Check-out</label>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className="field">
            <label>Guests</label>
            <select value={guests} onChange={(e) => setGuests(e.target.value)}>
              {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} guest{n>1?'s':''}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Rooms</label>
            <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
              {[1,2,3,4].map((n) => <option key={n} value={n}>{n} room{n>1?'s':''}</option>)}
            </select>
          </div>

          <div className="divider" />
          <div className="row"><span>${hotel.pricePerNight} × {nights} night{nights>1?'s':''} × {rooms} room{rooms>1?'s':''}</span><span>${total}</span></div>
          <div className="row"><span>Taxes & fees</span><span>Included</span></div>
          <div className="row total"><span>Total</span><span>${total}</span></div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={book}>
            {getUser() ? 'Book now' : 'Sign in to book'}
          </button>
          {!getUser() && (
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
              🔒 You need an account to complete a booking.
            </p>
          )}
        </aside>
      </div>

      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignedIn={() => proceedBooking()}
        title="Sign in to book"
        subtitle="Please sign in to complete your reservation."
      />
    </div>
  )
}
