// E-commerce/frontend/src/context/UserContext.jsx

import { useContext, createContext, useState, useEffect } from 'react'
import { getProfileService } from '../services/authServices.js'

export const UserContext = createContext({})

export const UserContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({})
  const [loading, setLoading] = useState(true)

  // funcion para verificar la sesion del usuario
  const checkSession = async () => {
    try {
      setLoading(true)
      const userData = await getProfileService()
      setUserInfo(userData)
    } catch (error) {
      console.error('no hay sesion activa', error)
      setUserInfo({})
    } finally {
      setLoading(false)
    }
  }
  // funsion para obtener el id del usuario
  const getUserId = () => {
    return userInfo?.id || null
  }

  // funcion si el usuario esta autentificado
  const isAuthenticated = () => {
    return !!userInfo?.id
  }
  // funcion
  useEffect(() => {
    checkSession()
  }, [])
  return (
    <UserContext.Provider
      value={{
        userInfo,
        loading,
        setUserInfo,
        checkSession,
        getUserId,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
