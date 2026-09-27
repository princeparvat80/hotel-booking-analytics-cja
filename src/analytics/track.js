// ---------------------------------------------------------------------------
// TripNest tracking API  —  DATA LAYER ONLY
// ---------------------------------------------------------------------------
// This site uses Adobe DATA COLLECTION (a Tags / Launch property). The website's
// only job is to push a clean, rich event to window.adobeDataLayer (the Adobe
// Client Data Layer). The Tags property then does the rest:
//
//   adobeDataLayer.push(...)                      <- this file
//        │
//        ▼
//   Adobe Client Data Layer extension (in Tags)   detects the event
//        │
//        ▼
//   Rule (event = "<name>")  ->  Data Elements map state to XDM
//        │
//        ▼
//   AEP Web SDK extension  ->  Send Event  ->  Datastream  ->  Adobe Analytics
//
// So there is NO alloy/sendEvent call here. Everything the rules need must be
// present in the object we push. Field names mirror SCHEMA.md so data elements
// map cleanly. See DATA-COLLECTION-SETUP.md for the exact rules/data elements.
// ---------------------------------------------------------------------------

// Strip undefined/null so the data layer stays clean.
function prune(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function push(payload) {
  window.adobeDataLayer = window.adobeDataLayer || []
  const clean = prune(payload)
  window.adobeDataLayer.push(clean)
  console.info('[TripNest][dataLayer]', clean.event, clean)
}

// Build the product list item (mirrors XDM productListItems -> Analytics products)
function productItem(hotel, { nights = 1, totalValue } = {}) {
  return {
    id: hotel.id,
    name: hotel.name,
    category: 'Hotels',
    quantity: nights,
    price: totalValue != null ? totalValue : hotel.pricePerNight * nights,
  }
}

// ---- Public tracking functions -------------------------------------------

export function trackPageView(pageName) {
  push({
    event: 'pageView',
    page: {
      name: pageName,
      url: window.location.href,
      referrer: document.referrer,
      siteSection: pageName.split('-')[0],
    },
  })
}

export function trackSearch({ destination, searchTerm, resultsCount, filterApplied, sortOrder }) {
  push({
    event: 'search',
    search: {
      destination,
      searchTerm: searchTerm || destination,
      resultsCount,
      filterApplied,
      sortOrder,
    },
  })
}

export function trackHotelView(hotel) {
  push({
    event: 'hotelView',
    commerce: { productViews: { value: 1 } },
    product: productItem(hotel),
    hotel: { id: hotel.id, name: hotel.name, rating: hotel.rating, stars: hotel.stars },
  })
}

export function trackBookingStart(hotel, details) {
  push({
    event: 'bookingStart',
    commerce: { productListAdds: { value: 1 } },
    product: productItem(hotel, details),
    hotel: { id: hotel.id, name: hotel.name, rating: hotel.rating },
    booking: { ...details },
  })
}

export function trackCheckout(hotel, details) {
  push({
    event: 'checkout',
    commerce: { checkouts: { value: 1 } },
    product: productItem(hotel, details),
    hotel: { id: hotel.id, name: hotel.name },
    booking: { ...details },
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
      },
    },
    product: productItem(hotel, details),
    hotel: { id: hotel.id, name: hotel.name, rating: hotel.rating },
    booking: { ...details },
  })
}

export function trackLogin({ email, loyaltyTier = 'gold' }) {
  push({
    event: 'login',
    user: { email, loyaltyTier, loggedIn: true },
  })
}
