# TripNest — Adobe Data Collection (Tags / Launch) Setup

This site sends data the **Data Collection** way: the website only pushes to
`window.adobeDataLayer`, and a **Tags (Launch) property** reads that data layer
and sends events to Adobe Analytics via the **Web SDK + datastream**.

```
Website push  →  adobeDataLayer  →  [Tags property]
                                       ├─ Adobe Client Data Layer extension (listens)
                                       ├─ Data Elements (map data layer → XDM)
                                       ├─ Rules (event = "<name>" → Send Event)
                                       └─ AEP Web SDK extension → Datastream → Adobe Analytics
```

---

## Step 1 — Create the Datastream
- Data Collection → **Datastreams** → New.
- Enable the **Adobe Analytics** service → map to your report suite
  (e.g. `tripnest-analytics-dev`).
- (Optional) also enable **Adobe Experience Platform** → dataset on the
  `TripNest Booking ExperienceEvent` schema (see SCHEMA.md) if you want XDM in AEP too.

## Step 2 — Create the Tags property
- Data Collection → **Tags** → New Property → type **Web** → your site URL.

### Add extensions
1. **Adobe Experience Platform Web SDK** — configure with your **datastream** (per environment) and your **IMS Org ID**.
2. **Adobe Client Data Layer** (ACDL).

## Step 3 — Data Elements
Create these as **Adobe Client Data Layer** data elements (they read the merged
data layer state). Names on the left are suggestions.

| Data element | Data layer path |
|---|---|
| `DL - page name` | `page.name` |
| `DL - page url` | `page.url` |
| `DL - search` | `search` (whole object) |
| `DL - product` | `product` (whole object) |
| `DL - hotel` | `hotel` |
| `DL - booking` | `booking` |
| `DL - commerce` | `commerce` |
| `DL - order id` | `commerce.order.purchaseID` |
| `DL - order total` | `commerce.order.priceTotal` |
| `DL - user` | `user` |

Then build one **XDM Object** data element (type provided by the Web SDK
extension, bound to your schema) that maps the above into XDM:

| XDM field | From |
|---|---|
| `web.webPageDetails.name` | DL - page name |
| `web.webPageDetails.URL` | DL - page url |
| `commerce` | DL - commerce |
| `productListItems[0].SKU` | product.id |
| `productListItems[0].name` | product.name |
| `productListItems[0].quantity` | product.quantity |
| `productListItems[0].priceTotal` | product.price |
| `_<tenant>.booking.*` | DL - booking fields |
| `_<tenant>.search.*` | DL - search fields |

## Step 4 — Rules (one per event)
For each, **Event = Adobe Client Data Layer → “<name>”**, **Action = AEP Web SDK →
Send Event** using the XDM Object data element and the matching `eventType`.

| Rule name | Data layer event | eventType |
|---|---|---|
| Page View | `pageView` | `web.webpagedetails.pageViews` |
| Search | `search` | `commerce.productListViews` |
| Hotel View | `hotelView` | `commerce.productViews` |
| Booking Start | `bookingStart` | `commerce.productListAdds` |
| Checkout | `checkout` | `commerce.checkouts` |
| Purchase | `purchase` | `commerce.order` |
| Login | `login` | `web.webinteraction.linkClicks` (or a custom eventType) |

## Step 5 — Publish & embed
- Add the property to a Library → **Build** to the Development environment.
- Copy the environment **embed script** and paste it into `index.html`
  (there is a clearly marked placeholder near the top of `<head>`).

## Step 6 — Validate
1. **Browser console** — every action logs `[TripNest][dataLayer] <event>`.
2. **Adobe Assurance / Experience Platform Debugger** — see the ACDL event, the
   rule firing, the Web SDK `sendEvent`, and the Edge response.
3. **Adobe Analytics** — confirm hits in real-time / Workspace.
4. **Analytics Data Connector → AEP → CJA** — bring the report suite into AEP and
   build a CJA data view on top.
