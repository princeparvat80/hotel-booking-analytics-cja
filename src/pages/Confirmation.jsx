import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { trackPageView } from '../analytics/track'

export default function Confirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    trackPageView('booking-confirmation')
  }, [])

  if (!state?.hotel) {
    return (
      <div className="container section confirm">
        <h1>No booking to show</h1>
        <button className="btn btn-brand" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
          Back to home
        </button>
      </div>
    )
  }

  const { hotel, details, guest } = state

  return (
    <div className="container confirm">
      <div className="confirm-badge">✓</div>
      <h1>Booking confirmed!</h1>
      <p style={{ color: 'var(--muted)', marginTop: 8 }}>
        Thanks {guest?.firstName || 'traveller'}, your stay is booked.
      </p>
      <div className="booking-id">Booking ID: {details.bookingId}</div>

      <div className="panel summary-card">
        <h3>{hotel.name}</h3>
        <div className="row"><span>Location</span><span>{hotel.city}, {hotel.country}</span></div>
        <div className="row"><span>Room</span><span>{details.roomType}</span></div>
        <div className="row"><span>Check-in</span><span>{details.checkInDate}</span></div>
        <div className="row"><span>Check-out</span><span>{details.checkOutDate}</span></div>
        <div className="row"><span>Nights</span><span>{details.nights}</span></div>
        <div className="row"><span>Guests</span><span>{details.guests}</span></div>
        <div className="row"><span>Payment</span><span>{details.paymentMethod}</span></div>
        <div className="row"><span>Loyalty tier</span><span>{details.loyaltyTier}</span></div>
        <div className="divider" />
        <div className="row total"><span>Total paid</span><span>${details.totalValue}</span></div>
      </div>

      <p className="debug-note" style={{ maxWidth: 520, margin: '20px auto 0' }}>
        🎉 The <code>purchase</code> event (with revenue and products) went to the data layer;
        the Tags property sent it to Adobe Analytics via Web SDK. Validate it in Assurance,
        then follow it through the Analytics Data Connector into AEP for CJA.
      </p>

      <div style={{ marginTop: 24 }}>
        <Link to="/" className="btn btn-brand">Book another stay</Link>
      </div>
    </div>
  )
}
