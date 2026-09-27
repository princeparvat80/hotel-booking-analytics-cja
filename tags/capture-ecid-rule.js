// ---------------------------------------------------------------------------
// Tags Rule:  "TripNest - Capture ECID"
// ---------------------------------------------------------------------------
// Event:  Core > Library Loaded (Page Top)   [or DOM Ready]
// Action: Core > Custom Code  (paste the code below)
//
// The Experience Cloud ID (ECID) is assigned by the Edge Network, so we ask the
// Web SDK for it via getIdentity and stash it on window._tnECID. The analytics
// data element then reads it into eVar23 (ECID).
//
// NOTE: getIdentity is async. The very first pageView may not have the ECID yet;
// every subsequent hit will. (Our events are spaced ~350ms apart, so search /
// hotelView / etc. reliably include it.)
// ---------------------------------------------------------------------------

if (window.alloy) {
  window.alloy("getIdentity")
    .then(function (res) {
      if (res && res.identity && res.identity.ECID) {
        window._tnECID = res.identity.ECID;
      }
    })
    .catch(function () {});
}
