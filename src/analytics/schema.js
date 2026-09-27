// ---------------------------------------------------------------------------
// XDM builders — turn plain app data into XDM that matches
// "TripNest Booking ExperienceEvent" (see SCHEMA.md).
// ---------------------------------------------------------------------------

import { config } from './config'

// Wrap custom fields under the tenant prefix, e.g. { _princeparvat: { booking } }
function tenantWrap(customObject) {
  return { [config.tenant]: customObject }
}

// A single product list item -> Analytics "products" variable.
// quantity = nights, priceTotal = total booking value.
function productListItem(hotel, { nights = 1, totalValue } = {}) {
  return {
    SKU: hotel.id,
    name: hotel.name,
    quantity: nights,
    priceTotal: totalValue != null ? totalValue : hotel.pricePerNight * nights,
    _experience: undefined,
  }
}

// Base web/page context added to every event.
export function baseWebContext(pageName) {
  return {
    web: {
      webPageDetails: {
        name: pageName,
        URL: typeof window !== 'undefined' ? window.location.href : '',
      },
      webReferrer: {
        URL: typeof document !== 'undefined' ? document.referrer : '',
      },
    },
    environment: {
      type: 'browser',
    },
  }
}

// ---- Event-specific XDM builders -----------------------------------------

export function xdmPageView(pageName) {
  return {
    eventType: 'web.webpagedetails.pageViews',
    ...baseWebContext(pageName),
    web: {
      ...baseWebContext(pageName).web,
      webPageDetails: {
        name: pageName,
        URL: typeof window !== 'undefined' ? window.location.href : '',
        pageViews: { value: 1 },
      },
    },
  }
}

export function xdmSearch({ destination, searchTerm, resultsCount }) {
  return {
    eventType: 'commerce.productListViews',
    ...baseWebContext('search-results'),
    commerce: {
      productListViews: { value: 1 },
    },
    ...tenantWrap({
      search: { destination, searchTerm: searchTerm || destination, resultsCount },
    }),
  }
}

export function xdmHotelView(hotel) {
  return {
    eventType: 'commerce.productViews',
    ...baseWebContext('hotel-detail'),
    commerce: { productViews: { value: 1 } },
    productListItems: [productListItem(hotel)],
    ...tenantWrap({
      booking: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelRating: hotel.rating,
      },
    }),
  }
}

export function xdmBookingStart(hotel, details) {
  return {
    eventType: 'commerce.productListAdds',
    ...baseWebContext('booking-start'),
    commerce: { productListAdds: { value: 1 } },
    productListItems: [productListItem(hotel, details)],
    ...tenantWrap({ booking: { ...bookingAttributes(hotel, details) } }),
  }
}

export function xdmCheckout(hotel, details) {
  return {
    eventType: 'commerce.checkouts',
    ...baseWebContext('checkout'),
    commerce: { checkouts: { value: 1 } },
    productListItems: [productListItem(hotel, details)],
    ...tenantWrap({ booking: { ...bookingAttributes(hotel, details) } }),
  }
}

export function xdmPurchase(hotel, details) {
  const total =
    details.totalValue != null
      ? details.totalValue
      : hotel.pricePerNight * (details.nights || 1)
  return {
    eventType: 'commerce.order',
    ...baseWebContext('booking-confirmation'),
    commerce: {
      purchases: { value: 1 },
      order: {
        purchaseID: details.bookingId,
        priceTotal: total,
        currencyCode: 'USD',
      },
    },
    productListItems: [productListItem(hotel, { ...details, totalValue: total })],
    ...tenantWrap({ booking: { ...bookingAttributes(hotel, { ...details, totalValue: total }) } }),
  }
}

// Shared custom booking attributes.
function bookingAttributes(hotel, details = {}) {
  return {
    bookingId: details.bookingId,
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelRating: hotel.rating,
    roomType: details.roomType,
    tripType: details.tripType,
    checkInDate: details.checkInDate,
    checkOutDate: details.checkOutDate,
    nights: details.nights,
    guests: details.guests,
    totalValue: details.totalValue,
    paymentMethod: details.paymentMethod,
    loyaltyTier: details.loyaltyTier,
  }
}
