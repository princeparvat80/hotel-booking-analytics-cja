import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import SignInModal from './SignInModal.jsx'
import { getUser, onUserChange } from '../analytics/session'
import { trackLogout } from '../analytics/track'

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false)
  const [user, setUser] = useState(getUser()) // persisted across refresh

  // Keep the header in sync with session changes (login/logout).
  useEffect(() => onUserChange(setUser), [])

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-badge">✦</span> TripNest
        </Link>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/search">Hotels</NavLink>
          <NavLink to="/deals">Deals</NavLink>
          <NavLink to="/help">Help</NavLink>
        </nav>
        <div className="header-cta">
          {user ? (
            <>
              <span className="nav" style={{ color: 'var(--brand)' }}>
                ◆ {cap(user.loyaltyTier)} · {user.email}
              </span>
              <button className="btn btn-outline" onClick={trackLogout}>Sign out</button>
            </>
          ) : (
            <button className="btn btn-outline" onClick={() => setModalOpen(true)}>
              Sign in
            </button>
          )}
        </div>
      </div>

      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  )
}
