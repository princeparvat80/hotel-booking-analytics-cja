// ---------------------------------------------------------------------------
// Adobe Web SDK configuration (read from Vite env vars, see .env.example)
// ---------------------------------------------------------------------------

export const config = {
  datastreamId: import.meta.env.VITE_DATASTREAM_ID || '',
  orgId: import.meta.env.VITE_ORG_ID || '',
  edgeDomain: import.meta.env.VITE_EDGE_DOMAIN || '',
  // XDM tenant prefix for custom fields (e.g. "_princeparvat").
  tenant: import.meta.env.VITE_XDM_TENANT || '_tripnest',
}

// Web SDK only fires real network calls when both IDs are present.
// Otherwise the app runs in "data layer only" demo mode.
export const webSdkEnabled = Boolean(config.datastreamId && config.orgId)
