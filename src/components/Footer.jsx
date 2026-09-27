export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="logo">✦ TripNest</div>
        <small>Find and book hotels, resorts and stays worldwide.</small>
        <small>© {new Date().getFullYear()} TripNest</small>
      </div>
    </footer>
  )
}
