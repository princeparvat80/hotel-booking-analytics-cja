import { useState } from 'react'
import { trackLogin } from '../analytics/track'

// Lightweight demo sign-in. It does NOT authenticate anything — it just captures
// an email, pushes a `login` event to the data layer (great for the analytics
// demo), and closes.
export default function SignInModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('gold')

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    // trackLogin persists the session and notifies the header via onUserChange.
    trackLogin({ email, loyaltyTier: tier })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h3 style={{ fontSize: 22, marginBottom: 4 }}>Sign in to TripNest</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
          Members unlock loyalty pricing and faster checkout.
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Loyalty tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="none">None</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
