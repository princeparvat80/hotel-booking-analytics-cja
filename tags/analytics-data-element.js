// ---------------------------------------------------------------------------
// Tags Custom Code Data Element:  "TripNest - Analytics Data"
// ---------------------------------------------------------------------------
// Paste this into the Tags property data element (Core > Custom Code).
// It returns the data.__adobe.analytics object (eVars + props) that the Web SDK
// Send Event action sends as `Data`. It reads the whole Adobe Client Data Layer
// computed state via getState(), so it also has visitor/device/marketing context.
//
// Allocation guidance:
//   eVar = persistent, for attributing bookings/revenue to a dimension
//   prop = pathing / real-time, per-hit
//   Page/Products/Revenue/purchase come from XDM auto-map (not set here)
// ---------------------------------------------------------------------------

var dl = (window.adobeDataLayer && window.adobeDataLayer.getState)
  ? window.adobeDataLayer.getState() : {};
var booking   = dl.booking   || {};
var search    = dl.search    || {};
var page      = dl.page      || {};
var visitor   = dl.visitor   || {};
var device    = dl.device    || {};
var marketing = dl.marketing || {};

var a = {};

// ---------- eVars: persistent, for attributing bookings/revenue ----------
if (search.destination)          a.eVar1  = search.destination;
if (search.searchTerm)           a.eVar2  = search.searchTerm;
if (booking.hotelName)           a.eVar3  = booking.hotelName;
if (booking.hotelId)             a.eVar4  = booking.hotelId;
if (booking.starRating != null)  a.eVar5  = String(booking.starRating);
if (booking.roomType)            a.eVar6  = booking.roomType;
if (booking.ratePlan)            a.eVar7  = booking.ratePlan;
if (booking.boardType)           a.eVar8  = booking.boardType;
if (booking.tripType)            a.eVar9  = booking.tripType;
if (booking.nights != null)      a.eVar10 = String(booking.nights);
if (booking.guests != null)      a.eVar11 = String(booking.guests);
if (booking.rooms != null)       a.eVar12 = String(booking.rooms);
if (booking.bookingId)           a.eVar13 = booking.bookingId;
if (booking.paymentMethod)       a.eVar14 = booking.paymentMethod;
if (booking.loyaltyTier)         a.eVar15 = booking.loyaltyTier;
if (search.filterApplied)        a.eVar16 = search.filterApplied;
if (search.sortOrder)            a.eVar17 = search.sortOrder;
if (page.name)                   a.eVar18 = page.name;
if (visitor.type)                a.eVar19 = visitor.type;
if (device.type)                 a.eVar20 = device.type;
if (marketing.campaign)          a.eVar21 = marketing.campaign;
if (booking.cancellationPolicy)  a.eVar22 = booking.cancellationPolicy;

// ---------- props: pathing / real-time ----------
if (page.name)                   a.prop1  = page.name;
if (page.siteSection)            a.prop2  = page.siteSection;
if (search.destination)          a.prop3  = search.destination;
if (booking.hotelName)           a.prop4  = booking.hotelName;
if (device.type)                 a.prop5  = device.type;
if (booking.tripType)            a.prop6  = booking.tripType;
if (booking.loyaltyTier)         a.prop7  = booking.loyaltyTier;
if (visitor.type)                a.prop8  = visitor.type;
if (search.filterApplied)        a.prop9  = search.filterApplied;
if (search.sortOrder)            a.prop10 = search.sortOrder;

return { __adobe: { analytics: a } };
