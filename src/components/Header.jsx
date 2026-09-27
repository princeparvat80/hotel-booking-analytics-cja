import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-badge">✦</span> TripNest
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/search">Hotels</Link>
          <a href="#deals">Deals</a>
          <a href="#help">Help</a>
        </nav>
        <div className="header-cta">
          <span className="nav" style={{ color: 'var(--brand)' }}>◆ Gold Member</span>
          <button className="btn btn-outline">Sign in</button>
        </div>
      </div>
    </header>
  )
}
