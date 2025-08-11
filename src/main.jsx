import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Browser polyfills for Node.js globals
import { Buffer } from 'buffer'
import process from 'process'

// Make globals available
window.Buffer = Buffer
window.process = process

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
