// ---------------------------------------------------------------------------
// Adobe Web SDK (Alloy) bootstrap
// ---------------------------------------------------------------------------
// We load Alloy via the npm package and configure a single instance named
// "alloy". Every event in the app is sent through this instance to the Edge
// Network, which forwards it to Adobe Analytics (via the datastream's
// Adobe Analytics service).
// ---------------------------------------------------------------------------

import { createInstance } from '@adobe/alloy'
import { config, webSdkEnabled } from './config'

let alloy = null

export function initWebSdk() {
  if (alloy) return alloy

  // Create the Alloy instance regardless, so calls never throw.
  alloy = createInstance({ name: 'alloy' })

  if (!webSdkEnabled) {
    console.info(
      '[TripNest][WebSDK] Running in DATA-LAYER-ONLY mode. ' +
        'Set VITE_DATASTREAM_ID and VITE_ORG_ID in .env to send to Adobe.'
    )
    return alloy
  }

  const configuration = {
    datastreamId: config.datastreamId,
    orgId: config.orgId,
    debugEnabled: true, // shows Web SDK logs + eases Assurance troubleshooting
  }
  if (config.edgeDomain) configuration.edgeDomain = config.edgeDomain

  alloy('configure', configuration)
  console.info('[TripNest][WebSDK] Configured with datastream', config.datastreamId)
  return alloy
}

// Safe accessor used by the tracking layer.
export function getAlloy() {
  if (!alloy) initWebSdk()
  return alloy
}
