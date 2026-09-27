import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import SignInModal from './SignInModal.jsx'

export default function Header() {
  const [modalOpen, setModalOpen] = useState(false)
  const [user, setUser] = useState(null)

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
            <span className="nav" style={{ color: 'var(--brand)' }}>
              ◆ {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} · {user.email}
            </span>
          ) : (
            <button className="btn btn-outline" onClick={() => setModalOpen(true)}>
              Sign in
            </button>
          )}
        </div>
      </div>

      <SignInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSignedIn={(u) => setUser(u)}
      />
    </header>
  )
}
