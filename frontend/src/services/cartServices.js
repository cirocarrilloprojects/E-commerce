// E-commerce/frontend/src/services/cartServices.js
/**
 * ARCHIVO : src/services/cartServices.js
 * CAPA    : servicios
 * ROL     : endpoints del carrito del usuario autenticado (/api/cart).
 * LO USA  : context/CartContext.jsx (único consumidor).
 * CAMBIO  : el backend v2 identifica al dueño por la cookie de sesión, así que YA NO se envía userId
 *           (antes: /cart/get/:userId, /cart/add con userId en el cuerpo…).
 * Todas las respuestas de mutación devuelven { message, cart } con el carrito actualizado.
 */
import { http } from '../lib/http'

export const getCart = (signal) =>
  http.get('/cart', { signal }).then((r) => r.data)
export const addCartItem = (productId, quantity = 1) =>
  http.post('/cart/items', { productId, quantity }).then((r) => r.data)
export const updateCartItem = (productId, quantity) =>
  http.put(`/cart/items/${productId}`, { quantity }).then((r) => r.data)
export const removeCartItem = (productId) =>
  http.delete(`/cart/items/${productId}`).then((r) => r.data)
export const clearCartRequest = () => http.delete('/cart').then((r) => r.data)
