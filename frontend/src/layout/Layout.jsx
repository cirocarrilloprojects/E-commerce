// E-commerce/frontend/src/layout/layout.jsx

/**
 * ARCHIVO : src/layouts/Layout.jsx
 * ROL     : estructura común de las páginas públicas: Navbar + contenido de la ruta activa.
 * LO USA  : AppRoutes.jsx (como "layout route").   USA: Navbar.
 * Suspense: muestra un cargador mientras se descarga el código de una página cargada con React.lazy.
 */
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/navbar/Navbar'
import { PageLoader } from '../components/ui/Spinner'

const Layout = () => (
  <div className="mx-auto w-full max-w-250 px-6 pb-10 lg:max-w-300">
    <Navbar />
    <main>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
)

export default Layout
