// E-commerce/frontend/src/App.jsx
/**
 * ARCHIVO : src/App.jsx
 * ROL     : raíz de la aplicación: monta los proveedores de estado global y las rutas.
 * LO USA  : main.jsx.   USA: UserProvider, CartProvider, BackendHealthProvider, AppRoutes, Toaster.
 *
 * ORDEN DE LOS PROVEEDORES:
 *   1) BackendHealthProvider (el más externo: nadie más depende de él)
 *   2) UserProvider          (depende de nada)
 *   3) CartProvider          (usa useUser)
 */
import { Toaster } from 'react-hot-toast'
import { BackendHealthProvider } from './hooks/useBackendHealth.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import AppRoutes from './AppRoutes'

const App = () => (
  <BackendHealthProvider>
    <UserProvider>
      <CartProvider>
        <AppRoutes />
        <Toaster />
      </CartProvider>
    </UserProvider>
  </BackendHealthProvider>
)

export default App
