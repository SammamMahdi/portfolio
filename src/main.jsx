import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { applyTheme, readSavedTheme } from './lib/themes'

applyTheme(readSavedTheme()) // before first paint, so there's no flash of the default theme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
