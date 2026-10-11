// E-commerce/backend/src/controllers/orderController.js

/**
 * ARCHIVO     : src/controllers/orderController.js
 * CAPA        : Controladores
 * ROL         : Traducir las peticiones de órdenes en llamadas a orderService.
 * LO CONSUME  : routes/orderRoutes.js (todas exigen sesión).
 * CONSUME     : services/orderService.js.
 * LO GENERA   : { paymentUrl, preferenceId, orderId } que el frontend usa para redirigir al checkout
 *               de Mercado Pago, y las consultas de órdenes del usuario.
 */
import * as orderService from '../services/orderService.js'

/**
 * createOrder — POST /api/orders
 * Entrada : req.user.id (token) + req.validated.body = { items:[{id,quantity}], shippingInfo }
 * Salida  : 201 { message, paymentUrl, preferenceId, orderId }
 * Siguiente paso: el frontend hace  window.location = paymentUrl.
 */
export const createOrder = async (req, res) => {
    const result = await orderService.createOrder(
        req.user.id,
        req.validated.body
    )
    res.status(201).json({ message: 'Orden creada exitosamente', ...result })
}

/** listMyOrders — GET /api/orders → 200 { orders } con las órdenes del usuario autenticado. */
export const listMyOrders = async (req, res) => {
    const orders = await orderService.listMyOrders(req.user.id)
    res.status(200).json({ orders })
}

/** getOrder — GET /api/orders/:id → 200 { order } (404 si no existe o es de otro usuario). */
export const getOrder = async (req, res) => {
    const order = await orderService.getOrderById(
        req.validated.params.id,
        req.user
    )
    res.status(200).json({ order })
}
