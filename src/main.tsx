import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// Importer le theme store force son initialisation (side effect).
// Le module applique la classe 'dark' sur <html> dès le chargement,
// en complément du script inline dans index.html (qui gère le pre-render).
import '@/stores/use-theme-store'
import { App } from './App'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
