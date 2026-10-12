// E-commerce/frontend/src/layout/DashboardLayout.jsx
/**
 * ARCHIVO : src/layouts/DashboardLayout.jsx
 * ROL     : marco del panel de administración (menú superior + contenido de la sección).
 * LO USA  : AppRoutes.jsx (ruta /admin/dashboard, protegida con ProtectedRoute adminOnly).
 * CORREGIDO: clase "bnt" (typo de "btn"); botón hamburguesa sin etiqueta accesible; <svg> decorativo sin aria-hidden.
 */
import { Link, Outlet } from 'react-router'

const DashboardLayout = () => (
  <>
    <nav
      className="navbar mt-8 bg-base-100 shadow-lg"
      aria-label="Administración"
    >
      <div className="dropdown md:hidden">
        <button
          type="button"
          className="btn btn-ghost"
          aria-label="Abrir menú de administración"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </button>
        <ul className="menu dropdown-content z-10 mt-3 rounded-box bg-base-100 p-2 shadow menu-sm">
          <li>
            <Link to="/admin/dashboard/products">Productos</Link>
          </li>
        </ul>
      </div>
      <div className="hidden md:mx-auto md:inline-flex md:gap-4">
        <Link className="btn btn-primary" to="/admin/dashboard/products">
          Productos
        </Link>
      </div>
    </nav>
    <Outlet />
  </>
)

export default DashboardLayout
