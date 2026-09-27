# TripNest — XDM Schema Specification

This document is the exact spec for the schema to create in AEP
(sandbox: **princeparvat-prod**). The website sends XDM that matches this
schema. The datastream's **Adobe Analytics** service auto-maps the standard
`web` and `commerce` fields to Analytics variables — so almost no manual
mapping is needed in Analytics.

---

## Schema

- **Name:** `TripNest Booking ExperienceEvent`
- **Class:** `XDM ExperienceEvent`

### Standard field groups to add

| Field group | Purpose | Auto-maps to Analytics |
|---|---|---|
| **Web Details** (`web`) | page name, page URL, referrer, link tracking | `pageName`, page URL, referrer, custom/exit links |
| **Environment Details** (`environment`) | device, browser, OS, screen | device/browser/OS dimensions |
| **Commerce Details** (`commerce`) | funnel metrics + product list | `products`, prodView, scAdd, scCheckout, purchase, revenue |

`eventType`, `timestamp`, and `identityMap` come from the ExperienceEvent class
automatically.

### Custom field group: `TripNest Booking Details`

Custom fields live under your tenant prefix (shown here as `_tripnest`; replace
with your real tenant, e.g. `_princeparvat`).

**Object `booking`:**

| Field | Type |
|---|---|
| `bookingId` | string |
| `hotelId` | string |
| `hotelName` | string |
| `hotelRating` | double |
| `roomType` | string |
| `tripType` | string (leisure / business) |
| `checkInDate` | date |
| `checkOutDate` | date |
| `nights` | integer |
| `guests` | integer |
| `totalValue` | double |
| `paymentMethod` | string |
| `loyaltyTier` | string |

**Object `search`:**

| Field | Type |
|---|---|
| `destination` | string |
| `searchTerm` | string |
| `resultsCount` | integer |
| `filterApplied` | string |
| `sortOrder` | string |

---

## How the funnel maps to XDM (and to Analytics)

| Site action | `eventType` | Key XDM (`commerce`) | Auto Analytics result |
|---|---|---|---|
| Page view | `web.webpagedetails.pageViews` | — | page view + `pageName` |
| Search | `commerce.productListViews` | `productListViews.value=1` | custom event / prodView list |
| Hotel viewed | `commerce.productViews` | `productViews.value=1` | `prodView` |
| Room selected / booking start | `commerce.productListAdds` | `productListAdds.value=1` | `scAdd` |
| Checkout | `commerce.checkouts` | `checkouts.value=1` | `scCheckout` |
| Booking confirmed | `commerce.order` | `purchases.value=1`, `order.priceTotal`, `order.purchaseID` | `purchase` + revenue |

`productListItems` (on every commerce event) carries:
`{ SKU: hotelId, name: hotelName, quantity: nights, priceTotal: totalValue }`
→ maps to the Analytics **products** variable automatically.

---

## Custom attributes in Analytics vs CJA

- **Standard `web` + `commerce` fields** → auto-map to Analytics with **zero**
  configuration.
- **Custom `booking` / `search` fields** → in Analytics these need light
  processing rules to land in specific eVars/props **only if you want them in
  classic Analytics reports**. For the **Analytics → AEP → CJA** story they map
  **directly** as CJA dimensions from the XDM field names, so no eVar wrangling
  is required in the migration target.

This is exactly the point the migration demo makes: XDM-first collection means
the data is already well-modeled for CJA.
