// E-commerce/frontend/src/components/Navbar/UserDropDown.jsx
import { useUser } from '../../context/UserContext.jsx'
import toast from 'react-hot-toast'
import { logoutService } from '../../services/authServices.js'
const UserDropDown = () => {
  const { setUserInfo } = useUser()
  const handleLogout = async () => {
    try {
      await logoutService()
      setUserInfo({})
      toast.success('sesion cerrada correctamente')
    } catch (error) {
      console.error('Error al cerrar sesion', error)
      toast.error('Error al iniciar sesion intente mas tarde')
    }
  }
  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <div className="w-10 rounded-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            alt="Avatar"
          />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow"
      >
        <li>
          <a className="justify-between">
            Perfil
            <span className="badge">Nuevo</span>
          </a>
        </li>
        <li>
          <a className="justify-between">Configuracion</a>
        </li>
        <li>
          <a onClick={handleLogout} className="justify-between">
            Cerrar sesion
          </a>
        </li>
      </ul>
    </div>
  )
}

export default UserDropDown
