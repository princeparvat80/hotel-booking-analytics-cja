# TripNest — Hotel Booking Demo (Website → Adobe Analytics via Web SDK)

**Purpose:** the *second* demo site in a two-part Adobe data-flow story. TripNest
is a hotel-booking website that sends **rich, XDM-based data to Adobe Analytics**
through the **Web SDK + Datastream**. It exists to demonstrate the migration path:

```
Website (Web SDK) → Datastream (Adobe Analytics service) → Adobe Analytics
        → Analytics Data Connector → AEP → CJA
```

This is the "bring existing Analytics data into AEP" chapter, complementing the
first demo (an e-commerce store that sends directly to AEP).

---

## Data-flow architecture

```
 User action
     │
     ▼
 window.adobeDataLayer.push(...)          ← readable event, visible in console/Assurance
     │
     ▼
 Web SDK  alloy("sendEvent", { xdm })     ← XDM matching "TripNest Booking ExperienceEvent"
     │
     ▼
 Adobe Edge Network  (Datastream)
     │  Adobe Analytics service auto-maps web + commerce XDM → Analytics variables
     ▼
 Adobe Analytics report suite
     │  Analytics Data Connector (source)
     ▼
 AEP dataset  →  Customer Journey Analytics
```

## The funnel and the events it sends

| Page / action | Data layer event | XDM `eventType` | Analytics result (auto-mapped) |
|---|---|---|---|
| Home load | `pageView` | `web.webpagedetails.pageViews` | page view + pageName |
| Search / filter | `search` | `commerce.productListViews` | search event |
| Hotel detail load | `hotelView` | `commerce.productViews` | prodView |
| Book now | `bookingStart` | `commerce.productListAdds` | scAdd |
| Checkout load | `checkout` | `commerce.checkouts` | scCheckout |
| Confirm & pay | `purchase` | `commerce.order` | purchase + revenue + products |

See **[SCHEMA.md](SCHEMA.md)** for the full XDM schema spec and the variable map.

---

## Setup

```bash
npm install
cp .env.example .env   # then fill in the two Adobe values
npm run dev            # http://localhost:5174
```

### Adobe configuration (done in Adobe, in parallel)
1. Create the XDM schema **TripNest Booking ExperienceEvent** (see SCHEMA.md).
2. Create a **Datastream** with the **Adobe Analytics** service enabled → your
   report suite (e.g. `tripnest-analytics-dev`).
3. Put the **Datastream ID** and **IMS Org ID** into `.env`.
4. (Optional) Also enable the **AEP** service on the datastream to land XDM in a
   dataset directly.

If `.env` is not configured, the site runs in **data-layer-only mode**: every
event is logged to the console and pushed to `window.adobeDataLayer`, but no
network call is made. This is handy for walking through the flow before Adobe is
wired up.

---

## How to validate (demo script)

1. **Browser console** — every action logs `[TripNest][WebSDK] sent ...` and
   pushes to `window.adobeDataLayer` (type `adobeDataLayer` in the console).
2. **Adobe Assurance** — connect a session and watch the `sendEvent` calls, the
   XDM payloads, and the Edge Network response.
3. **Adobe Analytics** — confirm hits in real-time / Workspace against the report
   suite.
4. **Analytics Data Connector → AEP** — verify the dataset fills, then build a
   **CJA** connection + data view on top of it.

---

## Tech
- React 18 + Vite
- react-router-dom
- @adobe/alloy (Web SDK)

## Project structure
```
src/
  analytics/
    config.js     env-driven config
    alloy.js      Web SDK bootstrap
    schema.js     app data → XDM builders
    track.js      the tracking API used by the UI
  components/     Header, Footer, SearchBar, HotelCard, StarRating
  pages/          Home, SearchResults, HotelDetail, Checkout, Confirmation
  data/hotels.js  mock inventory
```
