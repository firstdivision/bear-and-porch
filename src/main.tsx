import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './winamp.css'
import './band.css'

document.body.classList.add('band-site')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
