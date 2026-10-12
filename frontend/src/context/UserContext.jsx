// E-commerce/frontend/src/context/UserContext.jsx
/**
 * ARCHIVO : src/context/UserContext.jsx
 * CAPA    : estado global de SESIÓN (es el único estado realmente global junto al carrito)
 * ROL     : saber quién está logueado y ofrecer login / register / logout.
 * LO USA  : App.jsx (lo monta), CartContext (para saber si hay sesión), ProtectedRoute, Navbar, UserDropDown,
 *           LoginForm, RegisterForm, Checkout…  vía el hook  useUser().
 * USA     : services/authServices.js.
 * LO GENERA: { user, loading, isAuthenticated, login, register, logout }.
 *
 * ERRORES DEL CÓDIGO ANTERIOR QUE CORRIGE:
 *  - App importaba "UserContextProviver" (typo) pero el archivo exportaba "UserContextProvider" → componente undefined.
 *  - CartContext llamaba isAuthenticated() y getUserId() como FUNCIONES, pero aquí eran un booleano y un valor.
 *  - Exponía setUserInfo a todo el mundo: la lógica de login/logout estaba repartida por componentes y servicios.
 *    Ahora la lógica vive aquí y los componentes solo llaman login()/logout().
 *  - El valor del contexto se recreaba en cada render (todos los consumidores se re-renderizaban): ahora useMemo.
 *  - createContext({}) ocultaba el olvido del Provider: ahora useUser() lanza un error claro.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authApi from '../services/authServices'
import { isCanceled } from '../lib/http'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null) // null = sin sesión
  const [loading, setLoading] = useState(true) // true mientras se verifica la cookie al abrir la app

  // Al montar: ¿hay una sesión válida? (la cookie httpOnly viaja sola). Se cancela si el componente se desmonta.
  useEffect(() => {
    const controller = new AbortController()

    authApi
      .getProfile(controller.signal)
      .then(setUser)
      .catch((error) => {
        if (isCanceled(error)) return
        if (error.status !== 401)
          console.error('No se pudo verificar la sesión:', error.message) // 401 = no logueado (normal)
        setUser(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const login = useCallback(async (credentials) => {
    const loggedUser = await authApi.login(credentials)
    setUser(loggedUser)
    return loggedUser
  }, [])

  const register = useCallback(async (data) => {
    const { user: newUser } = await authApi.register(data) // el servidor ya deja la sesión iniciada (cookie)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null) // CartContext detecta el cambio y vuelve al carrito local
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de <UserProvider>')
  return context
}
