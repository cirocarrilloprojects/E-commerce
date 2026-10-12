// E-commerce/frontend/src/components/Navbar/UserDropDown.jsx
/**
 * ARCHIVO : src/components/navbar/UserDropDown.jsx
 * ROL     : menú del usuario con sesión: acceso a "Mis órdenes" y cierre de sesión.
 * LO USA  : Navbar.jsx.   USA: UserContext (user, logout).
 * CAMBIOS : la lógica de logout vive en UserContext (antes llamaba al servicio y a setUserInfo desde aquí);
 *           los ítems son <button>/<Link> reales (antes <a> sin href, inaccesibles con teclado);
 *           el avatar usa la inicial del usuario (antes una imagen externa de daisyui.com);
 *           se eliminaron los enlaces "Perfil/Configuración" que no llevaban a ningún sitio.
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
        className="btn btn-circle btn-ghost avatar avatar-placeholder"
        aria-label={`Menú de ${user.username}`}
      >
        <span className="w-10 rounded-full bg-neutral text-neutral-content uppercase">
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
