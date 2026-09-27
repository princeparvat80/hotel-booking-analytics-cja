# TripNest — Hotel Booking Demo (Website → Adobe Analytics via Data Collection)

**Purpose:** the *second* demo site in a two-part Adobe data-flow story. TripNest
is a hotel-booking website that sends **rich data to Adobe Analytics** through
**Adobe Data Collection (a Tags/Launch property) + Web SDK + Datastream**. It
exists to demonstrate the migration path:

```
Website → adobeDataLayer → Tags property (Web SDK) → Datastream (Analytics service)
        → Adobe Analytics → Analytics Data Connector → AEP → CJA
```

This is the "bring existing Analytics data into AEP" chapter, complementing the
first demo (an e-commerce store that sends directly to AEP).

---

## Data-flow architecture

```
 User action
     │
     ▼
 window.adobeDataLayer.push({ event, ... })     ← the ONLY thing the website does
     │
     ▼
 Tags (Launch) property
   ├─ Adobe Client Data Layer extension  (listens for events)
   ├─ Data Elements                      (map data layer → XDM)
   ├─ Rules  (event = "<name>")          (trigger Send Event)
   └─ AEP Web SDK extension  →  sendEvent
     │
     ▼
 Adobe Edge Network (Datastream)  → Adobe Analytics service auto-maps web+commerce XDM
     │
     ▼
 Adobe Analytics report suite
     │  Analytics Data Connector
     ▼
 AEP dataset  →  Customer Journey Analytics
```

## The funnel and the events it pushes

| Page / action | `adobeDataLayer` event | Tags rule → XDM `eventType` | Analytics result |
|---|---|---|---|
| Home / Deals / Help load | `pageView` | `web.webpagedetails.pageViews` | page view + pageName |
| Search / filter / sort | `search` | `commerce.productListViews` | search event |
| Hotel detail load | `hotelView` | `commerce.productViews` | prodView |
| Book now | `bookingStart` | `commerce.productListAdds` | scAdd |
| Checkout load | `checkout` | `commerce.checkouts` | scCheckout |
| Confirm & pay | `purchase` | `commerce.order` | purchase + revenue + products |
| Sign in | `login` | link/custom event | login event |

- **[SCHEMA.md](SCHEMA.md)** — the XDM schema spec + variable map.
- **[DATA-COLLECTION-SETUP.md](DATA-COLLECTION-SETUP.md)** — the exact Tags
  property setup (extensions, data elements, rules, embed).

---

## Run the site

```bash
npm install
npm run dev            # http://localhost:5174
```

The website has **no Adobe config in code** — it only writes to
`window.adobeDataLayer`. All sending is configured in the Tags property. Until
you paste your Tags embed into `index.html`, the site runs in
**data-layer-only mode**: every event is logged to the console and visible via
`window.adobeDataLayer`, which is perfect for walking through the flow.

### To connect Adobe (done in the Adobe UI — see DATA-COLLECTION-SETUP.md)
1. Create the datastream (Adobe Analytics service → report suite).
2. Create the Tags property (Web SDK + ACDL extensions, data elements, rules).
3. Publish it and paste the **embed script** into `index.html`.

---

## Validate (demo script)
1. **Console** — every action logs `[TripNest][dataLayer] <event>`. Type
   `adobeDataLayer` in the console to inspect the full state.
2. **Assurance / Experience Platform Debugger** — watch the ACDL event, the rule
   firing, the Web SDK `sendEvent`, and the Edge response.
3. **Adobe Analytics** — confirm hits in real-time / Workspace.
4. **Analytics Data Connector → AEP → CJA** — bring the report suite into AEP and
   build a CJA data view.

---

## Tech
- React 18 + Vite
- react-router-dom
- Adobe Data Collection (Tags) + Web SDK — configured in Adobe, not in code

## Project structure
```
src/
  analytics/track.js   push rich events to window.adobeDataLayer (the only Adobe touchpoint)
  components/          Header (+ Sign-in modal), Footer, SearchBar, HotelCard, StarRating
  pages/               Home, SearchResults, HotelDetail, Checkout, Confirmation, Deals, Help
  data/hotels.js       mock inventory
index.html             holds the adobeDataLayer init + Tags embed placeholder
```
