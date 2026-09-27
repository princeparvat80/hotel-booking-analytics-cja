// ---------------------------------------------------------------------------
// TripNest tracking API
// ---------------------------------------------------------------------------
// This is the ONLY module the UI imports. Each function:
//   1. Pushes a readable event to window.adobeDataLayer (visible in console +
//      Adobe Assurance).
//   2. Sends the matching XDM to the Edge Network via Web SDK (Alloy), which
//      forwards it to Adobe Analytics through the datastream.
// ---------------------------------------------------------------------------

import { getAlloy } from './alloy'
import { webSdkEnabled } from './config'
import {
  xdmPageView,
  xdmSearch,
  xdmHotelView,
  xdmBookingStart,
  xdmCheckout,
  xdmPurchase,
} from './schema'

// Remove undefined/null so payloads stay clean (Web SDK dislikes undefined).
function prune(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function pushDataLayer(event, payload) {
  window.adobeDataLayer = window.adobeDataLayer || []
  window.adobeDataLayer.push(prune({ event, ...payload }))
}

async function sendEvent(xdm) {
  const clean = prune(xdm)
  if (!webSdkEnabled) {
    console.info('[TripNest][WebSDK] (skipped, demo mode) would send XDM:', clean)
    return
  }
  try {
    await getAlloy()('sendEvent', { xdm: clean })
    console.info('[TripNest][WebSDK] sent', clean.eventType)
  } catch (err) {
    console.error('[TripNest][WebSDK] sendEvent failed', err)
  }
}

// ---- Public tracking functions -------------------------------------------

export function trackPageView(pageName) {
  pushDataLayer('pageView', { page: { name: pageName } })
  return sendEvent(xdmPageView(pageName))
}

export function trackSearch({ destination, searchTerm, resultsCount }) {
  pushDataLayer('search', {
    search: { destination, searchTerm: searchTerm || destination, resultsCount },
  })
  return sendEvent(xdmSearch({ destination, searchTerm, resultsCount }))
}

export function trackHotelView(hotel) {
  pushDataLayer('hotelView', {
    hotel: { id: hotel.id, name: hotel.name, rating: hotel.rating },
  })
  return sendEvent(xdmHotelView(hotel))
}

export function trackBookingStart(hotel, details) {
  pushDataLayer('bookingStart', { hotel: { id: hotel.id, name: hotel.name }, booking: details })
  return sendEvent(xdmBookingStart(hotel, details))
}

export function trackCheckout(hotel, details) {
  pushDataLayer('checkout', { hotel: { id: hotel.id, name: hotel.name }, booking: details })
  return sendEvent(xdmCheckout(hotel, details))
}

export function trackPurchase(hotel, details) {
  pushDataLayer('purchase', {
    hotel: { id: hotel.id, name: hotel.name },
    booking: details,
    order: { id: details.bookingId, total: details.totalValue },
  })
  return sendEvent(xdmPurchase(hotel, details))
}
