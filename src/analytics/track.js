// ---------------------------------------------------------------------------
// TripNest tracking API  —  DATA LAYER ONLY
// ---------------------------------------------------------------------------
// The website's only job is to push a clean, rich event to window.adobeDataLayer
// (the Adobe Client Data Layer). The Tags / Launch property reads this data layer
// and sends events to Adobe Analytics via the Web SDK + datastream.
//
//   adobeDataLayer.push(...)  ->  Tags (ACDL ext + rules)  ->  Web SDK  ->  Analytics
//
// IMPORTANT: the Adobe Client Data Layer keeps a MERGED running state. To stop
// event-specific data (e.g. a purchase) from leaking into the next event, every
// push first resets the transient branches to `undefined` (which removes them
// from the computed state), then applies the current event's data.
//
// The `booking` and `search` objects mirror the XDM schema field names 1:1, so in
// Tags you can map the WHOLE object (_aepsupport.booking, _aepsupport.search)
// instead of field by field.
// ---------------------------------------------------------------------------

import { getGlobalContext, loginUser, logoutUser, getSessionDurationSec } from './session'

// Branches that belong to a single event and must not persist across events.
const TRANSIENT = ['commerce', 'product', 'booking', 'search', 'authentication', 'hotel']

// Remove nested undefined/null from the event payload (keeps its shape).
function pruneNested(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// The Adobe Client Data Layer processes pushes ASYNCHRONOUSLY in batches. If two
// events fire in the same tick (e.g. pageView + search, or login -> bookingStart
// -> checkout), every Tags rule ends up reading the SAME final merged state and
// the events bleed into each other. To prevent that we serialize events through a
// small queue and space them out, so each event is processed on its own.
const EVENT_GAP_MS = 350
let queue = []
let draining = false

// Hold the FIRST event until the Web SDK has resolved the ECID (set on
// window._tnECID by the "TripNest - Capture ECID" Tags rule), so even the first
// pageView carries eVar23. Never wait longer than ECID_MAX_WAIT so a missing rule
// or slow edge can't block tracking forever.
const ECID_MAX_WAIT_MS = 2500
let firstWaitStart = null

function drain() {
  if (!queue.length) { draining = false; return }
  draining = true

  // Gate only until the ECID is available (or we time out); once present, no wait.
  if (!window._tnECID) {
    if (firstWaitStart === null) firstWaitStart = Date.now()
    if (Date.now() - firstWaitStart < ECID_MAX_WAIT_MS) {
      setTimeout(drain, 50)
      return
    }
  }

  const obj = queue.shift()

  // 1) reset transient branches (undefined removes the key from computed state)
  const reset = {}
  TRANSIENT.forEach((k) => { reset[k] = undefined })
  window.adobeDataLayer.push(reset)

  // 2) push the actual event (its own object, its own processing cycle)
  window.adobeDataLayer.push(obj)
  console.info('[TripNest][dataLayer]', obj.event, obj)

  setTimeout(drain, EVENT_GAP_MS)
}

function push(payload) {
  window.adobeDataLayer = window.adobeDataLayer || []
  const obj = {
    event: payload.event,
    eventInfo: {
      timestamp: new Date().toISOString(),
      sessionDurationSec: getSessionDurationSec(),
    },
    ...getGlobalContext(),
    ...pruneNested(payload),
  }
  queue.push(obj)
  if (!draining) drain()
}

// A single product list item -> XDM productListItems -> Analytics products.
function productItem(hotel, { nights = 1, totalValue } = {}) {
  const price = totalValue != null ? totalValue : hotel.pricePerNight * nights
  return {
    id: hotel.id,
    name: hotel.name,
    category: 'Hotels',
    quantity: nights,
    price,
  }
}

// The `booking` object — field names match the XDM schema _aepsupport.booking.
function bookingBlock(hotel, details = {}) {
  return {
    bookingId: details.bookingId,
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelRating: hotel.rating,
    starRating: hotel.stars,
    roomType: details.roomType,
    ratePlan: details.ratePlan,
    boardType: details.boardType,
    tripType: details.tripType,
    checkInDate: details.checkInDate,
    checkOutDate: details.checkOutDate,
    nights: details.nights,
    guests: details.guests,
    rooms: details.rooms || 1,
    totalValue: details.totalValue,
    paymentMethod: details.paymentMethod,
    loyaltyTier: details.loyaltyTier,
    cancellationPolicy: details.cancellationPolicy || 'free-24h',
  }
}

// ---- Public tracking functions -------------------------------------------

export function trackPageView(pageName) {
  push({
    event: 'pageView',
    page: {
      name: pageName,
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      siteSection: pageName.split('-')[0],
    },
  })
}

// Only the 5 schema `search` fields are pushed (extras are ignored on purpose).
export function trackSearch({ destination, searchTerm, resultsCount, filterApplied, sortOrder }) {
  push({
    event: 'search',
    commerce: { productListViews: { value: 1 } },
    search: {
      destination,
      searchTerm: searchTerm || destination,
      resultsCount,
      filterApplied: filterApplied || 'none',
      sortOrder: sortOrder || 'recommended',
    },
  })
}

export function trackHotelView(hotel) {
  push({
    event: 'hotelView',
    commerce: { productViews: { value: 1 } },
    product: productItem(hotel),
    booking: bookingBlock(hotel, {}),
  })
}

export function trackBookingStart(hotel, details) {
  push({
    event: 'bookingStart',
    commerce: { productListAdds: { value: 1 } },
    product: productItem(hotel, details),
    booking: bookingBlock(hotel, details),
  })
}

export function trackCheckout(hotel, details) {
  push({
    event: 'checkout',
    commerce: { checkouts: { value: 1 } },
    product: productItem(hotel, details),
    booking: bookingBlock(hotel, details),
  })
}

export function trackPurchase(hotel, details) {
  push({
    event: 'purchase',
    commerce: {
      purchases: { value: 1 },
      order: {
        purchaseID: details.bookingId,
        priceTotal: details.totalValue,
        currencyCode: 'USD',
        payments: [
          { paymentType: details.paymentMethod, currencyCode: 'USD', paymentAmount: details.totalValue },
        ],
      },
    },
    product: productItem(hotel, details),
    booking: bookingBlock(hotel, details),
  })
}

export function trackLogin({ email, loyaltyTier = 'gold' }) {
  const user = loginUser({ email, loyaltyTier })
  push({
    event: 'login',
    authentication: { action: 'login', method: 'email', success: true },
    user: { authenticated: true, customerId: user.customerId, loyaltyTier: user.loyaltyTier },
  })
  return user
}

export function trackLogout() {
  logoutUser()
  push({ event: 'logout', authentication: { action: 'logout', success: true } })
}
