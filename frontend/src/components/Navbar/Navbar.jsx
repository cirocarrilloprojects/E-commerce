//E-commerce/frontend/src/components/Navbar/Navbar.jsx

import { Link } from 'react-router'
import Cart from './Cart.jsx'
import Authbuttons from './AuthButtons.jsx'
import UserDropDown from './UserDropDown.jsx'
import { useUser } from '../../context/UserContext.jsx'

const Navbar = () => {
  const { loading, userInfo } = useUser()

  return (
    <header>
      <Authbuttons />
      <nav className="navbar bg-base-100 text-base-content shadow-sm w-full">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">
            E-commerce
          </Link>
        </div>
        <div className="navbar-end gap-3">
          {userInfo?.isAdmin && (
            <Link to="/" className="btn btn-primary">
              Dashboard
            </Link>
          )}
          <Cart />
          {!loading && userInfo?.username && <UserDropDown />}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
