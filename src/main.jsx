import {readTheme} from './lib/theme'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import './index.css'

try { document.documentElement.dataset.theme = readTheme(localStorage) } catch { document.documentElement.dataset.theme = 'light' }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.pathname.startsWith('/admin') ? <AdminApp /> : <App />}
  </React.StrictMode>,
)

