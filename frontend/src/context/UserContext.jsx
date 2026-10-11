// E-commerce/frontend/src/context/UserContext.jsx
import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { getProfileService } from '../services/authServices.js'

export const UserContext = createContext({})

export const UserContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({})
  const [loading, setLoading] = useState(true)

  // Verificar sesión (estable, no se recrea en cada render)
  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      const userData = await getProfileService()
      setUserInfo(userData)
    } catch (error) {
      // 401 es normal (no logueado), no lo tratamos como error
      if (error.response?.status !== 401) {
        console.error('Error al verificar sesión:', error.message)
      }
      setUserInfo({})
    } finally {
      setLoading(false)
    }
  }, [])

  // Valores derivados
  const userId = userInfo?.id || null
  const isAuthenticated = !!userInfo?.id

  // Ejecutar checkSession al montar (y cuando checkSession cambie)
  useEffect(() => {
    checkSession()
  }, [checkSession])

  const value = {
    userInfo,
    loading,
    setUserInfo,
    checkSession,
    userId,
    isAuthenticated,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
