//E-commerce/frontend/src/main.jsx
/**
 * ARCHIVO : src/main.jsx — punto de entrada de Vite (lo carga index.html).
 * ROL     : montar React en #root con StrictMode (detecta efectos sin limpieza y otros errores en desarrollo)
 *           y el BrowserRouter que habilita las rutas.
 * USA     : App.jsx.   LO USA: index.html.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
