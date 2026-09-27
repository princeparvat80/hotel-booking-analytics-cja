// ---------------------------------------------------------------------------
// Session / visitor management for TripNest
// ---------------------------------------------------------------------------
// This is a lightweight, first-party session layer (no Adobe cookies here).
//
//   - visitorId : persistent, survives across sessions   -> localStorage
//   - sessionId : one per browser session (tab lifetime) -> sessionStorage
//   - user      : persisted login so it survives refresh -> localStorage
//   - visitorType: "new" on first ever visit, else "returning"
//
// When the Adobe Tags property / Web SDK is added later, Adobe will set its own
// ECID cookie (kndctr_<ORG>_identity). This module stays independent of that and
// simply provides rich context that we attach to every data layer event.
// ---------------------------------------------------------------------------

const LS_VISITOR = 'tn_visitor_id'
const LS_USER = 'tn_user'
const SS_SESSION = 'tn_session_id'
const SS_SESSION_START = 'tn_session_start'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

let _isNewVisitor = false

// Persistent visitor id (creates one on first ever visit).
export function getVisitorId() {
  let id = localStorage.getItem(LS_VISITOR)
  if (!id) {
    id = 'v-' + uuid()
    localStorage.setItem(LS_VISITOR, id)
    _isNewVisitor = true
  }
  return id
}

// Per-session id (new whenever a fresh browser session starts).
export function getSessionId() {
  let id = sessionStorage.getItem(SS_SESSION)
  if (!id) {
    id = 's-' + uuid()
    sessionStorage.setItem(SS_SESSION, id)
    sessionStorage.setItem(SS_SESSION_START, String(Date.now()))
  }
  return id
}

export function getVisitorType() {
  // getVisitorId must run first; _isNewVisitor is set there.
  return _isNewVisitor ? 'new' : 'returning'
}

export function getSessionDurationSec() {
  const start = Number(sessionStorage.getItem(SS_SESSION_START) || Date.now())
  return Math.round((Date.now() - start) / 1000)
}

// ---- Logged-in user (persisted) ------------------------------------------

const listeners = new Set()
export function onUserChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
function emit(user) {
  listeners.forEach((fn) => fn(user))
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER) || 'null')
  } catch {
    return null
  }
}

export function loginUser({ email, loyaltyTier = 'gold' }) {
  const user = {
    email,
    loyaltyTier,
    loggedIn: true,
    // A stable hashed-style id for the customer (demo only, not real hashing).
    customerId: 'c-' + btoa(email).replace(/=/g, '').slice(0, 12),
    loginAt: new Date().toISOString(),
  }
  localStorage.setItem(LS_USER, JSON.stringify(user))
  emit(user)
  return user
}

export function logoutUser() {
  localStorage.removeItem(LS_USER)
  emit(null)
}

// ---- Global context attached to every event ------------------------------

function detectDeviceType() {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function marketingFromUrl() {
  const p = new URLSearchParams(window.location.search)
  const campaign = p.get('utm_campaign') || p.get('cid')
  if (!campaign && !p.get('utm_source')) return undefined
  return {
    campaign: campaign || undefined,
    source: p.get('utm_source') || undefined,
    medium: p.get('utm_medium') || undefined,
    term: p.get('utm_term') || undefined,
  }
}

// The rich context object merged into every data layer push.
export function getGlobalContext() {
  const visitorId = getVisitorId()
  const user = getUser()
  return {
    site: {
      brand: 'TripNest',
      businessUnit: 'travel',
      environment: 'demo',
      language: navigator.language || 'en-US',
      currency: 'USD',
      platform: 'web',
    },
    device: {
      type: detectDeviceType(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    visitor: {
      id: visitorId,
      type: getVisitorType(),
    },
    session: {
      id: getSessionId(),
      durationSec: getSessionDurationSec(),
    },
    user: user
      ? { authenticated: true, customerId: user.customerId, loyaltyTier: user.loyaltyTier }
      : { authenticated: false, loyaltyTier: 'none' },
    marketing: marketingFromUrl(),
  }
}
