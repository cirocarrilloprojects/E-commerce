//E-commerce/frontend/src/components/Navbar/Navbar.jsx
/**
 * ARCHIVO : src/components/navbar/Navbar.jsx
 * ROL     : barra superior: marca, acceso al dashboard (solo admin), carrito y menú de usuario o botones de acceso.
 * LO USA  : layouts/Layout.jsx.   USA: UserContext, AuthButtons, CartButton, CartModal, UserDropDown.
 * CAMBIO  : antes AuthButtons ("crear cuenta / iniciar sesión") se mostraba SIEMPRE, incluso con sesión iniciada.
 */
import { Link } from 'react-router'
import { useUser } from '../../context/UserContext'
import AuthButtons from './AuthButtons.jsx'
import CartButton from './CartButtons.jsx'
import CartModal from './CartModal.jsx'
import UserDropDown from './UserDropDown.jsx'

const Navbar = () => {
  const { user, loading, isAuthenticated } = useUser()

  return (
    <header>
      {!loading && !isAuthenticated && <AuthButtons />}
      <nav
        className="navbar w-full bg-base-100 shadow-sm lg:rounded-box"
        aria-label="Principal"
      >
        <div className="navbar-start">
          <Link className="btn btn-ghost text-xl" to="/">
            E-commerce
          </Link>
        </div>
        <div className="navbar-end gap-3">
          {user?.isAdmin && (
            <Link to="/admin/dashboard/products" className="btn btn-primary">
              Dashboard
            </Link>
          )}
          <CartButton />
          {isAuthenticated && <UserDropDown />}
        </div>
      </nav>
      <CartModal />
    </header>
  )
}

export default Navbar
