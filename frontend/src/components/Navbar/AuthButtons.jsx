//E-commerce/frontend/src/components/Navbar/AuthButtons.jsx
import { Link } from 'react-router'

const Authbuttons = () => {
  return (
    <div className="py-4 flex justify-center items-center gap-4 flex-wrap">
      <Link className="btn btn-neutral btn-outline" to="/register">
        crear cuenta
      </Link>
      <div className="hidden lg:block">|</div>
      <Link className="btn btn-neutral btn-outline" to="/login">
        iniciar sesion
      </Link>
    </div>
  )
}

export default Authbuttons
