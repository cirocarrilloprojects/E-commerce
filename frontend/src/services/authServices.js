// E-commerce/frontend/src/services/authServices.js
import axios from 'axios'
import toast from 'react-hot-toast'
// configuracion base de axios para autentificacion
const API_URL = import.meta.env.VITE_BACKEND_URL + '/auth'
// http://localhost:3000/api/auth/register
// http://localhost:3000/api/auth/profile

// http://localhost:3000/api/auth/login

// para incluir la cookies en las peticiones
axios.defaults.withCredentials = true

export const getProfileService = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`)
    console.log('Respuesta de /profile:', response.data)
    return response.data
  } catch (error) {
    console.warn(
      'ℹ️ getProfileService:',
      error.response?.status || error.message,
      error.response?.data,
    )
    throw error
  }
}

export const loginService = async (data, reset, setUserInfo, setRedirect) => {
  try {
    const response = await axios.post(`${API_URL}/login`, data, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })

    // si la respuesta es exitos
    if (response.status === 200) {
      setUserInfo(response.data)
      reset()
      setRedirect(true)
      return {
        success: true,
        message: 'Inicio de sesion exitoso',
      }
    }
  } catch (error) {
    console.log('Error al loguearse')
    return {
      success: false,
      message: 'Error al loguearse',
    }
  }
}

export const registerService = async (
  data,
  reset,
  setRedirect,
  checkSession,
) => {
  try {
    const response = await axios.post(`${API_URL}/register`, data, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })
    console.log('📥 Respuesta de /register:', response.data)
    if (reset) reset()
    if (setRedirect) setRedirect(true)
    if (checkSession) await checkSession() // ← al final, ya con cookie seteada

    return {
      message: true,
    }
  } catch (error) {
    console.error('❌ Error en registerService:', error)
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error al registrarse'
    throw new Error(msg)
  }
}

export const logoutService = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error al cerrar la sesion',
    )
  }
}
