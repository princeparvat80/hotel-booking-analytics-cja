import { useEffect } from 'react'
import { trackPageView } from '../analytics/track'

const FAQS = [
  {
    q: 'How do I book a hotel on TripNest?',
    a: 'Search for a destination, open a hotel, choose your dates and room, then click Book now to go to checkout.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Most stays offer free cancellation up to 24 hours before check-in. Check the hotel policy on the booking page.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Credit card, debit card, PayPal and UPI are all supported at checkout.',
  },
  {
    q: 'How does the loyalty programme work?',
    a: 'Sign in to earn nights toward Silver, Gold and Platinum tiers, each unlocking better pricing.',
  },
]

export default function Help() {
  useEffect(() => {
    trackPageView('help')
  }, [])

  return (
    <div className="container section" style={{ maxWidth: 780 }}>
      <div className="section-head">
        <div>
          <h2>Help & FAQ</h2>
          <p>Answers to the questions travellers ask most</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        {FAQS.map((f) => (
          <div className="panel" key={f.q}>
            <h3 style={{ fontSize: 17, marginBottom: 6 }}>{f.q}</h3>
            <p style={{ color: 'var(--muted)' }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
