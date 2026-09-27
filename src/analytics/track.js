// ---------------------------------------------------------------------------
// TripNest tracking API  —  DATA LAYER ONLY
// ---------------------------------------------------------------------------
// The website's only job is to push a clean, rich event to window.adobeDataLayer
// (the Adobe Client Data Layer). The Tags / Launch property reads this data layer
// and sends events to Adobe Analytics via the Web SDK + datastream.
//
//   adobeDataLayer.push(...)  ->  Tags (ACDL ext + rules)  ->  Web SDK  ->  Analytics
//
// Every push is enriched with a global context (site / device / visitor / session
// / user / marketing) from session.js, so each event carries full analytics data.
// Field names mirror SCHEMA.md so Tags data elements map cleanly.
// ---------------------------------------------------------------------------

import { getGlobalContext, loginUser, logoutUser, getSessionDurationSec } from './session'

// Strip undefined/null so the data layer stays clean.
function prune(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Push an event, merged with the global context.
function push(payload) {
  window.adobeDataLayer = window.adobeDataLayer || []
  const clean = prune({
    event: payload.event,
    eventInfo: {
      timestamp: new Date().toISOString(),
      sessionDurationSec: getSessionDurationSec(),
    },
    ...getGlobalContext(),
    ...payload,
  })
  window.adobeDataLayer.push(clean)
  console.info('[TripNest][dataLayer]', clean.event, clean)
}

// Build a rich product list item (mirrors XDM productListItems -> Analytics products).
function productItem(hotel, { nights = 1, totalValue, roomType, ratePlan, boardType } = {}) {
  const price = totalValue != null ? totalValue : hotel.pricePerNight * nights
  return {
    id: hotel.id,
    name: hotel.name,
    category: 'Hotels',
    subCategory: `${hotel.stars}-star`,
    city: hotel.city,
    country: hotel.country,
    starRating: hotel.stars,
    guestRating: hotel.rating,
    roomType,
    ratePlan,
    boardType,
    quantity: nights,
    unitPrice: hotel.pricePerNight,
    price,
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

export function trackSearch({
  destination, searchTerm, resultsCount, filterApplied, sortOrder,
  checkIn, checkOut, guests, nights, tripType,
}) {
  push({
    event: 'search',
    commerce: { productListViews: { value: 1 } },
    search: {
      destination,
      searchTerm: searchTerm || destination,
      resultsCount,
      filterApplied: filterApplied || 'none',
      sortOrder: sortOrder || 'recommended',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      guests: guests != null ? Number(guests) : undefined,
      tripType,
    },
  })
}

export function trackHotelView(hotel) {
  push({
    event: 'hotelView',
    commerce: { productViews: { value: 1 } },
    product: productItem(hotel),
    hotel: {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      country: hotel.country,
      guestRating: hotel.rating,
      reviews: hotel.reviews,
      starRating: hotel.stars,
      pricePerNight: hotel.pricePerNight,
      amenities: hotel.amenities,
    },
  })
}

export function trackBookingStart(hotel, details) {
  push({
    event: 'bookingStart',
    commerce: { productListAdds: { value: 1 } },
    product: productItem(hotel, details),
    hotel: { id: hotel.id, name: hotel.name, city: hotel.city, guestRating: hotel.rating },
    booking: bookingBlock(details),
  })
}

export function trackCheckout(hotel, details) {
  push({
    event: 'checkout',
    commerce: { checkouts: { value: 1 } },
    product: productItem(hotel, details),
    hotel: { id: hotel.id, name: hotel.name, city: hotel.city },
    booking: bookingBlock(details),
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
        payments: [{ paymentType: details.paymentMethod, currencyCode: 'USD', paymentAmount: details.totalValue }],
      },
    },
    product: productItem(hotel, details),
    hotel: { id: hotel.id, name: hotel.name, city: hotel.city, guestRating: hotel.rating },
    booking: bookingBlock(details),
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

// Rich booking block shared by booking/checkout/purchase.
function bookingBlock(details = {}) {
  const taxes = details.totalValue ? Math.round(details.totalValue * 0.12 * 100) / 100 : undefined
  return {
    bookingId: details.bookingId,
    roomType: details.roomType,
    ratePlan: details.ratePlan,
    boardType: details.boardType,
    tripType: details.tripType,
    checkInDate: details.checkInDate,
    checkOutDate: details.checkOutDate,
    nights: details.nights,
    guests: details.guests,
    rooms: details.rooms || 1,
    subtotal: details.totalValue,
    taxes,
    totalValue: details.totalValue,
    paymentMethod: details.paymentMethod,
    loyaltyTier: details.loyaltyTier,
    cancellationPolicy: details.cancellationPolicy || 'free-24h',
  }
}
