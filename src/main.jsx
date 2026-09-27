import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// NOTE: There is no Web SDK init here. This site sends data via a Data
// Collection (Tags / Launch) property, which is loaded by the embed script in
// index.html and reads window.adobeDataLayer. See DATA-COLLECTION-SETUP.md.

// NOTE: React.StrictMode is intentionally omitted. In development StrictMode
// double-invokes effects, which would fire every analytics event twice. Removing
// it keeps the tracking clean (one hit per action) for the demo.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
