import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// NOTE: There is no Web SDK init here. This site sends data via a Data
// Collection (Tags / Launch) property, which is loaded by the embed script in
// index.html and reads window.adobeDataLayer. See DATA-COLLECTION-SETUP.md.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
