//E-commerce/frontend/src/App.jsx
/**
 * ARCHIVO : src/App.jsx
 * ROL     : raíz de la aplicación: monta los proveedores de estado global y las rutas.
 * LO USA  : main.jsx.   USA: UserProvider, CartProvider, AppRoutes, Toaster.
 *
 * ORDEN DE LOS PROVEEDORES (importa): CartProvider usa useUser(), así que va DENTRO de UserProvider.
 * El estado de productos ya NO es global (antes ProductContext): cada pantalla usa su propio hook (useProducts/useProduct).
 */
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './context/UserContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import AppRoutes from './AppRoutes'

const App = () => (
  <UserProvider>
    <CartProvider>
      <AppRoutes />
      <Toaster />
    </CartProvider>
  </UserProvider>
)

export default App
