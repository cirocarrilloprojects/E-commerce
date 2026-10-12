// E-commerce/frontend/src/services/orderServices.js
/**
 * ARCHIVO : src/services/orderServices.js
 * CAPA    : servicios
 * ROL     : endpoints de órdenes (/api/orders). Todos exigen sesión.
 * LO USA  : pages/Checkout (createOrder), pages/PaymentResult + hooks/useOrderStatus (getOrder), pages/Orders (listOrders).
 * CAMBIO  : createOrder ahora envía SOLO { items:[{id, quantity}], shippingInfo }. El precio, el nombre y la
 *           moneda los decide el servidor (antes el cliente mandaba unit_price y se podía manipular).
 */
import { http } from '../lib/http'

/** POST /orders → { message, paymentUrl, preferenceId, orderId } */
export const createOrder = (payload) =>
  http.post('/orders', payload).then((r) => r.data)

/** GET /orders → { orders } del usuario autenticado. */
export const listOrders = (signal) =>
  http.get('/orders', { signal }).then((r) => r.data)

/** GET /orders/:id → { order } (404 si no existe o pertenece a otra persona). */
export const getOrder = (id, signal) =>
  http.get(`/orders/${id}`, { signal }).then((r) => r.data)
