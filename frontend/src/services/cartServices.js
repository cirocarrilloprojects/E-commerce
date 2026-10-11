// E-commerce/frontend/src/services/cartServices.js
import axios from 'axios'

// configuracion base de axios
// http://localhost:3000/api/cart
const API_URL = import.meta.env.VITE_BACKEND_URL + '/cart'

axios.defaults.withCredentials = true

//servicio para agregar proyecto producto al carrito
export const addToCartService = async (userId, productId, quantity = 1) => {
  try {
    const response = await axios.post(`${API_URL}/add`, {
      userId,
      productId,
      quantity,
    })
    return response.data
  } catch (error) {
    throw new Error('Error al agregar producto al carrito')
  }
}

// servicio para obtener el carrito del usuario
export const getCartSevice = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/get/${userId}`)
    return response.data
  } catch (error) {
    throw new Error('Error al obtener el carrito')
  }
}

// servico para actualizar la cantidad
export const updateCartService = async (userId, productId, quantity) => {
  try {
    const response = await axios.put(`${API_URL}/update/${userId}`, {
      productId,
      quantity,
    })
    return response.data
  } catch (error) {
    throw new Error('Error al actualizar el carrito')
  }
}

// servicio para eliminar un prodcuto del carrito
export const removeFromCartService = async (userId, productId) => {
  try {
    const response = await axios.delete(`${API_URL}/removeProduct/${userId}`, {
      data: { productId },
    })
    return response.data
  } catch (error) {
    throw new Error('Error al eliminar un producto')
  }
}

// funcion para limpiar el carrito
export const clearCartservice = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/clear/${userId}`)
    return response.data
  } catch (error) {
    throw new Error('Error al limpiar el carrito')
  }
}

// servicio para obtener el total del carrito
export const getCartTotalService = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/total/${userId}`)
    return response.data
  } catch (error) {
    throw new Error('al obtener el total del carrito')
  }
}
