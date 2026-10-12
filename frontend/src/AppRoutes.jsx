//E-commerce/frontend/src/AppRoutes.jsx

/**
 * ARCHIVO : src/AppRoutes.jsx
 * ROL     : mapa de rutas de toda la aplicación (en un solo lugar) con carga diferida (code splitting).
 * LO USA  : App.jsx.   USA: Layout, DashboardLayout, ProtectedRoute y las páginas.
 *
 * LAZY LOADING: las páginas poco frecuentes (checkout, pagos, órdenes y TODO el panel admin) se descargan solo cuando se
 * visitan (React.lazy). Vite las separa en archivos distintos (chunks) → el bundle inicial es más pequeño. Layout ya trae
 * un <Suspense> que muestra el cargador mientras tanto.
 *
 * ANTES: /orders no existía (404 en blanco), no había ruta comodín, el admin usaba un <Routes> anidado dentro de otra
 * página y las rutas protegidas se definían envolviendo cada elemento a mano.
 */
import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import DashboardLayout from './layout/DashboardLayout.jsx'
import Layout from './layout/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DetailProduct from './pages/DetailProduct.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register.jsx'
import { Navigate } from 'react-router'

const Checkout = lazy(() => import('./pages/Checkout'))
const PaymentResult = lazy(() => import('./pages/PaymentResult'))
const Orders = lazy(() => import('./pages/Orders'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const CreateProduct = lazy(() => import('./pages/admin/CreateProduct'))
const UpdateProduct = lazy(() => import('./pages/admin/UpdateProduct'))

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/detailProduct/:id" element={<DetailProduct />} />

      {/* Requieren sesión */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        {/* Mercado Pago redirige a /payment/success | failure | pending (ver back_urls del backend) */}
        <Route path="/payment/:status" element={<PaymentResult />} />
      </Route>

      {/* Solo administradores */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/createProduct" element={<CreateProduct />} />
        <Route path="products/updateProduct/:id" element={<UpdateProduct />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
)

export default AppRoutes
