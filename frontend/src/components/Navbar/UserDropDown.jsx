// E-commerce/frontend/src/components/Navbar/UserDropDown.jsx
/**
 * ARCHIVO : src/components/Navbar/UserDropDown.jsx
 * ROL     : menú del usuario con sesión: acceso a "Mis órdenes" y cierre de sesión.
 * LO USA  : Navbar.jsx.   USA: UserContext (user, logout).
 *
 * CORRECCIÓN VISUAL: el avatar ahora es un círculo perfecto.
 *   - Se quitaron las clases "avatar avatar-placeholder" del <button>: en DaisyUI 5 esperan
 *     una estructura <div class="avatar"><div>...</div></div> y no aportan nada cuando ya
 *     controlamos tamaño y forma con Tailwind.
 *   - El <span> interior ahora tiene ALTO Y ANCHO (h-10 w-10): antes solo tenía w-10,
 *     por lo que se estiraba verticalmente según el contenido y quedaba rectangular.
 *   - Se añadió "flex items-center justify-center" para centrar la inicial exactamente.
 */
import { Link, useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useUser } from '../../context/UserContext'
import { getErrorMessage } from '../../lib/http'

const UserDropDown = () => {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada correctamente')
      navigate('/')
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Error al cerrar sesión, intenta más tarde'),
      )
    }
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        className="btn btn-circle btn-ghost"
        aria-label={`Menú de ${user.username}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral text-base font-semibold text-neutral-content uppercase">
          {user.username[0]}
        </span>
      </button>
      <ul className="menu dropdown-content z-10 mt-3 w-52 rounded-box bg-base-100 p-2 shadow menu-sm">
        <li className="menu-title">{user.username}</li>
        <li>
          <Link to="/orders">Mis órdenes</Link>
        </li>
        <li>
          <button type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  )
}

export default UserDropDown
