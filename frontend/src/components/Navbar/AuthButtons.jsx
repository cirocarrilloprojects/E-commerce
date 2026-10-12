//E-commerce/frontend/src/components/Navbar/AuthButtons.jsx
/**
 * ARCHIVO : src/components/navbar/AuthButtons.jsx
 * ROL     : enlaces a registro e inicio de sesión para visitantes sin sesión.
 * LO USA  : Navbar.jsx (solo cuando NO hay sesión).
 */
import { Link } from 'react-router'

const AuthButtons = () => (
  <div className="flex flex-wrap items-center justify-center gap-4 py-4">
    <Link className="btn btn-neutral btn-outline" to="/register">
      Crear cuenta
    </Link>
    <span className="hidden lg:block" aria-hidden="true">
      |
    </span>
    <Link className="btn btn-neutral btn-outline" to="/login">
      Iniciar sesión
    </Link>
  </div>
)

export default AuthButtons
