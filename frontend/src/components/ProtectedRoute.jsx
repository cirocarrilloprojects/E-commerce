// E-commerce/frontend/src/components/ProtectedRoute/ProtectedRoute.jsx
/**
 * ARCHIVO : src/components/ProtectedRoute.jsx
 * CAPA    : guardia de rutas
 * ROL     : exige sesión (y opcionalmente rol de administrador) para ver una ruta.
 * LO USA  : AppRoutes.jsx (checkout, órdenes, pago y /admin/dashboard).
 * USA     : UserContext.
 *
 * Uso como "layout route":  <Route element={<ProtectedRoute />}> …rutas hijas… </Route>
 *                           <Route element={<ProtectedRoute adminOnly />}> …</Route>
 * Si no hay sesión → /login guardando la ruta original (state.from) para volver después de entrar.
 * IMPORTANTE: esto es solo UX. La seguridad real está en el backend (authenticate / requireAdmin).
 */
import { Navigate, Outlet, useLocation } from 'react-router'
import { useUser } from '../context/UserContext'
import { PageLoader } from './ui/Spinner'

const ProtectedRoute = ({ adminOnly = false, children }) => {
  const { user, loading, isAuthenticated } = useUser()
  const location = useLocation()

  if (loading) return <PageLoader label="Verificando sesión…" />
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />

  return children ?? <Outlet />
}

export default ProtectedRoute
