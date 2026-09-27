import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinations } from '../data/hotels'

// Reusable search widget with a custom, reliable autocomplete dropdown.
export default function SearchBar({ compact = false, initial = {} }) {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const nextWeek = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10)

  const [form, setForm] = useState({
    destination: initial.destination || '',
    checkIn: initial.checkIn || today,
    checkOut: initial.checkOut || nextWeek,
    guests: initial.guests || 2,
    tripType: initial.tripType || 'leisure',
  })

  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const boxRef = useRef(null)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Case-insensitive "contains" match; show all when the box is empty.
  const q = form.destination.trim().toLowerCase()
  const suggestions = q
    ? destinations.filter((d) => d.toLowerCase().includes(q))
    : destinations

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const choose = (value) => {
    setForm((f) => ({ ...f, destination: value }))
    setOpen(false)
    setHighlight(-1)
  }

  const onKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); choose(suggestions[highlight]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  const submit = (e) => {
    e.preventDefault()
    setOpen(false)
    const params = new URLSearchParams(form)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <form className={`search-bar ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <div className="field" ref={boxRef} style={{ position: 'relative' }}>
        <label>Destination</label>
        <input
          type="text"
          placeholder="Where are you going?"
          value={form.destination}
          autoComplete="off"
          onChange={(e) => { update('destination')(e); setOpen(true); setHighlight(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {open && suggestions.length > 0 && (
          <ul className="autocomplete">
            {suggestions.map((d, i) => (
              <li
                key={d}
                className={i === highlight ? 'active' : ''}
                onMouseDown={(e) => { e.preventDefault(); choose(d) }}
                onMouseEnter={() => setHighlight(i)}
              >
                📍 {d}
              </li>
            ))}
          </ul>
        )}
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
            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" type="submit">🔍 Search</button>
    </form>
  )
}
