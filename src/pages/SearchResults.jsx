import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import { hotels } from '../data/hotels'
import { trackPageView, trackSearch } from '../analytics/track'

const STAR_OPTIONS = [5, 4]
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Guest rating' },
]

export default function SearchResults() {
  const [params] = useSearchParams()
  const destination = params.get('destination') || ''
  const guests = params.get('guests') || '2'
  const tripType = params.get('tripType') || 'leisure'

  const [starFilter, setStarFilter] = useState([])
  const [maxPrice, setMaxPrice] = useState(500)
  const [sort, setSort] = useState('recommended')

  // Base list filtered by the destination search.
  const base = useMemo(() => {
    if (!destination) return hotels
    return hotels.filter(
      (h) =>
        h.city.toLowerCase().includes(destination.toLowerCase()) ||
        h.country.toLowerCase().includes(destination.toLowerCase())
    )
  }, [destination])

  // Page view + search event whenever the destination query changes.
  useEffect(() => {
    trackPageView('search-results')
    trackSearch({
      destination: destination || 'all',
      searchTerm: destination || 'all',
      resultsCount: base.length,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  // Apply filters + sort.
  const filtered = useMemo(() => {
    let list = base.filter((h) => h.pricePerNight <= maxPrice)
    if (starFilter.length) list = list.filter((h) => starFilter.includes(h.stars))
    switch (sort) {
      case 'price-low': list = [...list].sort((a, b) => a.pricePerNight - b.pricePerNight); break
      case 'price-high': list = [...list].sort((a, b) => b.pricePerNight - a.pricePerNight); break
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break
      default: break
    }
    return list
  }, [base, starFilter, maxPrice, sort])

  // Re-fire search event when a filter or sort is applied (rich Analytics data).
  const applyFilter = (filterDesc) => {
    trackSearch({
      destination: destination || 'all',
      searchTerm: `${destination || 'all'} | filter:${filterDesc} | sort:${sort}`,
      resultsCount: filtered.length,
    })
  }

  const toggleStar = (s) => {
    const next = starFilter.includes(s) ? starFilter.filter((x) => x !== s) : [...starFilter, s]
    setStarFilter(next)
    applyFilter(`stars=${next.join(',') || 'any'}`)
  }

  return (
    <div className="container section">
      <SearchBar compact initial={{ destination, guests, tripType }} />

      <p className="debug-note">
        🔎 Data flow: this search pushed a <code>search</code> event to
        <code> window.adobeDataLayer</code> and sent a <code>commerce.productListViews</code> XDM
        event to Adobe Analytics via Web SDK.
      </p>

      <div className="results" style={{ marginTop: 24 }}>
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <h4>Star rating</h4>
            {STAR_OPTIONS.map((s) => (
              <label className="check" key={s}>
                <input
                  type="checkbox"
                  checked={starFilter.includes(s)}
                  onChange={() => toggleStar(s)}
                />
                {s} stars
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Max price / night: ${maxPrice}</h4>
            <input
              type="range" min="150" max="500" step="10" value={maxPrice}
              style={{ width: '100%' }}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              onMouseUp={() => applyFilter(`maxPrice=${maxPrice}`)}
            />
          </div>
        </aside>

        <div>
          <div className="results-head">
            <div className="count">
              {filtered.length} stays{destination ? ` in ${destination}` : ''}
            </div>
            <div className="field" style={{ minWidth: 200 }}>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  applyFilter(`sort-change`)
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="results-list">
            {filtered.map((h) => (
              <HotelCard key={h.id} hotel={h} wide />
            ))}
            {!filtered.length && (
              <p style={{ color: 'var(--muted)' }}>No stays match your filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
