# TripNest — Adobe Setup Guide (names + order + variable map)

Everything you need to create in Adobe, with a consistent naming convention that
matches your report suite (`aeptripnestprince` / **Prince - TripNest**).

Flow being built:
```
Website → adobeDataLayer → Tags property (Web SDK) → Datastream
        → Adobe Analytics (Prince - TripNest) → Analytics Data Connector → AEP → CJA
```

---

## 1. Naming convention — create these

| # | Component | Name to use | Notes |
|---|---|---|---|
| ✅ | Report Suite | ID `aeptripnestprince` · Name `Prince - TripNest` | already created |
| 1 | XDM Schema | `Prince - TripNest Booking Event` | class = **XDM ExperienceEvent** |
| 2 | Custom field group | `Prince - TripNest Booking Details` | booking + search objects (see §4) |
| 3 | Dataset *(optional, only if you also want XDM in AEP directly)* | `Prince - TripNest Booking Event Dataset` | built on schema #1 |
| 4 | Datastream | `Prince - TripNest Web SDK` | env: Development; ID is auto-generated — copy it |
| 5 | Tag (Launch) property | `Prince - TripNest Web` | type = Web |
| 6 | Data elements | prefix `TripNest - ...` | e.g. `TripNest - Page Name` |
| 7 | Rules | prefix `TripNest - ...` | e.g. `TripNest - Page View` |

The Datastream **ID** and your **IMS Org ID** go into the Tag property's Web SDK
extension (not in the website code).

---

## 2. Order of operations (do it in this sequence)

1. **Schema** (#1) + **custom field group** (#2) — see §4. *(Optional for a pure
   Analytics first pass, but you asked for a schema, so build it.)*
2. **Datastream** (#4): add the **Adobe Analytics** service → report suite
   `aeptripnestprince`. *(Optional: also add the **Adobe Experience Platform**
   service → dataset #3 if you want XDM in AEP now.)*
3. **Enable eVars / props / events** in the report suite (see §5 — use the script).
4. **Datastream mapping** (see §6): map XDM → eVars/props. *No processing rules
   needed.*
5. **Tag property** (#5): extensions → data elements → rules → publish.
6. Paste the property **embed script** into `index.html` (placeholder is there).
7. **Validate** in Assurance, then Analytics, then wire the Analytics Data
   Connector → AEP → CJA.

---

## 3. Success events / eVars / props to create

**Custom success events** (the funnel; `prodView`, `scAdd`, `scCheckout`,
`purchase` are built-in — don't recreate them):

| Event | Name | Type |
|---|---|---|
| event1 | Hotel Search | Counter |
| event2 | Booking Started | Counter |
| event3 | Checkout Started | Counter |
| event4 | Login | Counter |
| event5 | Booking Revenue | Currency |

**eVars (conversion variables):**

| eVar | Name | eVar | Name |
|---|---|---|---|
| eVar1 | Destination | eVar12 | Rooms |
| eVar2 | Search Term | eVar13 | Booking ID |
| eVar3 | Hotel Name | eVar14 | Payment Method |
| eVar4 | Hotel ID | eVar15 | Loyalty Tier |
| eVar5 | Star Rating | eVar16 | Filter Applied |
| eVar6 | Room Type | eVar17 | Sort Order |
| eVar7 | Rate Plan | eVar18 | Visitor Type |
| eVar8 | Board Type | eVar19 | Customer ID |
| eVar9 | Trip Type | eVar20 | Device Type |
| eVar10 | Nights | eVar21 | Campaign |
| eVar11 | Guests | eVar22 | Cancellation Policy |

**props (traffic variables):**

| prop | Name | prop | Name |
|---|---|---|---|
| prop1 | Page Name | prop6 | Trip Type |
| prop2 | Site Section | prop7 | Loyalty Tier |
| prop3 | Destination | prop8 | Visitor Type |
| prop4 | Hotel Name | prop9 | Filter Applied |
| prop5 | Device Type | prop10 | Sort Order |

---

## 4. Schema (custom field group `Prince - TripNest Booking Details`)

Custom fields live under your tenant prefix (shown as `_tripnest`; replace with
your real tenant).

**Object `booking`:** bookingId (string), hotelId (string), hotelName (string),
hotelRating (double), starRating (integer), roomType (string), ratePlan (string),
boardType (string), tripType (string), checkInDate (date), checkOutDate (date),
nights (integer), guests (integer), rooms (integer), totalValue (double),
paymentMethod (string), loyaltyTier (string), cancellationPolicy (string)

**Object `search`:** destination (string), searchTerm (string), resultsCount
(integer), filterApplied (string), sortOrder (string)

Standard field groups to also add: **Web Details**, **Environment Details**,
**Commerce Details** (these auto-map to page name, products, and the funnel events).

---

## 5. Enabling eVars / props / events

eVars/props only store data once they are **enabled (named)** in the report suite.
A fresh suite enables only ~5-6 by default, which is what you saw.

### ⚠️ There is no supported bulk API anymore
- The **Adobe Analytics 1.4 Admin API** (`SaveEvars` / `SaveProps` /
  `SaveSuccessEvents`) that used to do this in bulk is **end-of-life**.
- The **2.0 API does not manage report-suite variable enablement**.

So the supported path is the **Report Suite Manager UI**. It's quick because each
page lets you enable/name many rows and **Save once**.

### UI steps (~10 min) — one Save per page
Analytics → **Admin → Report Suites** → check `aeptripnestprince` → **Edit Settings**.

**A) Conversion → Success Events** — click *Add New* five times, then set:
```
event1  Hotel Search       Counter
event2  Booking Started    Counter
event3  Checkout Started   Counter
event4  Login              Counter
event5  Booking Revenue    Currency
```
Click **Save**.

**B) Conversion → Conversion Variables** — tick the checkbox on eVar1–eVar22, set
each Name per §3, leave Allocation = *Most Recent (last)*, Expiration = *Visit*.
Click **Save** once at the bottom.

**C) Traffic → Traffic Variables** — tick prop1–prop10, set Names per §3.
Click **Save**.

> Tip: you can enable all rows on a page before the single Save — you do NOT save
> after every variable.

### If you insist on automation
The only way this could be scripted is if your org still has working **legacy 1.4
access** via OAuth (rare, and Adobe is retiring it). If you confirm 1.4 still
authenticates for your org, a Node script can be written against
`https://api.omniture.com/admin/1.4/rest/` — but expect it to be blocked. The UI
is the dependable choice.

---

## 6. Datastream mapping (XDM → Analytics variables) — no processing rules

In the Datastream → **Adobe Analytics** service → **Edit Mapping**, map each XDM
source field to its Analytics target. Standard fields auto-map; add these custom
ones (tenant shown as `_tripnest`):

| XDM source field | Analytics target |
|---|---|
| `_tripnest.search.destination` | eVar1 |
| `_tripnest.search.searchTerm` | eVar2 |
| `_tripnest.booking.hotelName` | eVar3 |
| `_tripnest.booking.hotelId` | eVar4 |
| `_tripnest.booking.starRating` | eVar5 |
| `_tripnest.booking.roomType` | eVar6 |
| `_tripnest.booking.ratePlan` | eVar7 |
| `_tripnest.booking.boardType` | eVar8 |
| `_tripnest.booking.tripType` | eVar9 / prop6 |
| `_tripnest.booking.nights` | eVar10 |
| `_tripnest.booking.guests` | eVar11 |
| `_tripnest.booking.rooms` | eVar12 |
| `_tripnest.booking.bookingId` | eVar13 |
| `_tripnest.booking.paymentMethod` | eVar14 |
| `_tripnest.booking.loyaltyTier` | eVar15 / prop7 |
| `_tripnest.search.filterApplied` | eVar16 / prop9 |
| `_tripnest.search.sortOrder` | eVar17 / prop10 |
| `visitor.type` (context) | eVar18 / prop8 |
| `user.customerId` | eVar19 |
| `device.type` (context) | eVar20 / prop5 |
| `marketing.campaign` | eVar21 |
| `_tripnest.booking.cancellationPolicy` | eVar22 |
| `web.webPageDetails.name` | prop1 (auto → pageName) |
| page site section | prop2 |

> Alternative to §6: instead of datastream mapping, the Tag rule can send a
> `data.__adobe.analytics` object (e.g. `eVar1`, `prop1`, `events`) built from data
> elements. That also skips processing rules. Pick **one** approach — datastream
> mapping keeps the website purely XDM/schema-driven, which is best for CJA.
