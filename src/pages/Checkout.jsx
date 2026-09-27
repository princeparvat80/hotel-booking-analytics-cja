import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { findHotel } from '../data/hotels'
import { trackCheckout, trackPurchase } from '../analytics/track'

function newBookingId() {
  return 'TN-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const hotel = findHotel(id)
  const details = location.state?.details || {
    roomType: hotel?.roomTypes?.[0], tripType: 'leisure',
    checkInDate: '', checkOutDate: '', nights: 1, guests: 2,
    totalValue: hotel?.pricePerNight || 0,
  }

  const [guest, setGuest] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    paymentMethod: 'credit-card', loyaltyTier: 'gold',
  })

  useEffect(() => {
    if (hotel) trackCheckout(hotel, details)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!hotel) {
    return (
      <div className="container section">
        <h2>Booking not found</h2>
        <button className="btn btn-brand" onClick={() => navigate('/search')}>Back to search</button>
      </div>
    )
  }

  const update = (k) => (e) => setGuest({ ...guest, [k]: e.target.value })

  const pay = (e) => {
    e.preventDefault()
    const bookingId = newBookingId()
    const purchaseDetails = {
      ...details,
      bookingId,
      paymentMethod: guest.paymentMethod,
      loyaltyTier: guest.loyaltyTier,
    }
    trackPurchase(hotel, purchaseDetails)
    navigate('/confirmation', {
      state: { hotel, details: purchaseDetails, guest },
    })
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Complete your booking</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        {hotel.name} — {hotel.city}, {hotel.country}
      </p>

      <p className="debug-note">
        🧾 This page sent a <code>commerce.checkouts</code> (scCheckout) event. Clicking
        <b> Confirm &amp; pay</b> fires <code>commerce.order</code> with <code>purchases=1</code> and
        revenue — the Analytics <b>purchase</b> event.
      </p>

      <form className="checkout-grid" onSubmit={pay}>
        <div className="panel">
          <h3>Guest details</h3>
          <div className="form-grid">
            <div className="field">
              <label>First name</label>
              <input required value={guest.firstName} onChange={update('firstName')} />
            </div>
            <div className="field">
              <label>Last name</label>
              <input required value={guest.lastName} onChange={update('lastName')} />
            </div>
            <div className="field full">
              <label>Email</label>
              <input type="email" required value={guest.email} onChange={update('email')} />
            </div>
            <div className="field full">
              <label>Phone</label>
              <input value={guest.phone} onChange={update('phone')} />
            </div>
          </div>

          <h3 style={{ marginTop: 24 }}>Payment</h3>
          <div className="form-grid">
            <div className="field full">
              <label>Payment method</label>
              <select value={guest.paymentMethod} onChange={update('paymentMethod')}>
                <option value="credit-card">Credit card</option>
                <option value="debit-card">Debit card</option>
                <option value="paypal">PayPal</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div className="field full">
              <label>Loyalty tier</label>
              <select value={guest.loyaltyTier} onChange={update('loyaltyTier')}>
                <option value="none">None</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>
        </div>

        <aside className="panel">
          <h3>Booking summary</h3>
          <div className="row"><span>Hotel</span><span>{hotel.name}</span></div>
          <div className="row"><span>Room</span><span>{details.roomType}</span></div>
          <div className="row"><span>Trip type</span><span>{details.tripType}</span></div>
          <div className="row"><span>Check-in</span><span>{details.checkInDate}</span></div>
          <div className="row"><span>Check-out</span><span>{details.checkOutDate}</span></div>
          <div className="row"><span>Nights</span><span>{details.nights}</span></div>
          <div className="row"><span>Guests</span><span>{details.guests}</span></div>
          <div className="divider" />
          <div className="row total"><span>Total</span><span>${details.totalValue}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} type="submit">
            Confirm &amp; pay ${details.totalValue}
          </button>
        </aside>
      </form>
    </div>
  )
}
