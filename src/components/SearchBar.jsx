import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinations } from '../data/hotels'

// Reusable search widget. On submit it navigates to /search with query params.
export default function SearchBar({ compact = false, initial = {} }) {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    destination: initial.destination || '',
    checkIn: initial.checkIn || today,
    checkOut: initial.checkOut || today,
    guests: initial.guests || 2,
    tripType: initial.tripType || 'leisure',
  })

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(form)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <form className={`search-bar ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <div className="field">
        <label>Destination</label>
        <input
          list="destinations"
          placeholder="Where are you going?"
          value={form.destination}
          onChange={update('destination')}
        />
        <datalist id="destinations">
          {destinations.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label>Check-in</label>
        <input type="date" value={form.checkIn} onChange={update('checkIn')} />
      </div>
      <div className="field">
        <label>Check-out</label>
        <input type="date" value={form.checkOut} onChange={update('checkOut')} />
      </div>
      <div className="field">
        <label>Guests</label>
        <select value={form.guests} onChange={update('guests')}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} guest{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" type="submit">
        🔍 Search
      </button>
    </form>
  )
}
