// E-commerce/frontend/src/layout/Layout.jsx
/**
 * ARCHIVO : src/layout/Layout.jsx
 * ROL     : estructura común de las páginas públicas: Navbar + banner de estado + contenido.
 * LO USA  : AppRoutes.jsx (como "layout route").   USA: Navbar, BackendStatusBanner.
 */
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/navbar/Navbar'
import BackendStatusBanner from '../components/ui/BackendStatusBanner'
import { PageLoader } from '../components/ui/Spinner'

const Layout = () => (
  <div className="mx-auto w-full max-w-250 px-6 pb-10 lg:max-w-300">
    <Navbar />
    <BackendStatusBanner />
    <main>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
)

export default Layout
