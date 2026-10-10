// E-commerce/frontend/src/services/authServices.js
import axios from 'axios'

// configuracion base de axios para autentificacion
const API_URL = import.meta.env.VITE_BACKEND_URL + '/auth'
// http://localhost:3000/api/auth/register

// para incluir la cookies en las peticiones
axios.defaults.withCredentials = true

export const getProfileService = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const loginService = async () => {}

export const registerService = async (
  data,
  reset,
  setRedirect,
  checkSession,
) => {
  try {
    const response = await axios.post(`${API_URL}/register`, data, {
      headers: { 'Content-type': 'application/json' },
      withCredentials: true,
    })
    console.log('Respuesta', response)
    if (response.status === 201 || response.status === 200) {
      alert('REGISTRO EXITOSOS DEL USUARIO')
      reset() // reinicia el formulario despues del registro de usuario
    }
  } catch (error) {
    alert('Error al registrarse')
  }
}

export const logoutService = async () => {}
