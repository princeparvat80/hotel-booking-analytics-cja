export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="logo">✦ TripNest</div>
        <small>
          Demo site — data flows to Adobe Analytics via Web SDK + Datastream.
          Part of the Analytics → AEP → CJA migration demo.
        </small>
        <small>© {new Date().getFullYear()} TripNest</small>
      </div>
    </footer>
  )
}
