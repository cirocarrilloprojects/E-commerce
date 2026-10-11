// E-commerce/backend/src/services/orderService.js

/**
 * ARCHIVO     : src/services/orderService.js
 * CAPA        : Servicios
 * ROL         : Crear la orden de compra y su link de pago en Mercado Pago, y consultar órdenes.
 * LO CONSUME  : controllers/orderController.js.
 * CONSUME     : models (Order, Product, User), config/mercadopago.js (mpPreference), env, AppError.
 * LO GENERA   : una orden en estado "pending" + la URL de pago (init_point) que el frontend abre.
 *               El RESULTADO del pago no se decide aquí: lo informa Mercado Pago al webhook
 *               (webhookController → paymentService.applyPaymentToOrder).
 *
 * FLUJO DE COMPRA (resumen):
 *   Frontend ──POST /api/orders {items,shippingInfo}──► createOrder
 *      1. lee productos y precios REALES de la BD (el cliente no decide precios)
 *      2. valida stock y calcula el total
 *      3. guarda la orden "pending"
 *      4. crea la preferencia en Mercado Pago (external_reference = id de la orden)
 *      5. devuelve paymentUrl → el cliente paga en Mercado Pago
 *   Mercado Pago ──POST /api/webhook──► paymentService → orden approved/rejected + descuento de stock
 */
import Order from '../models/OrderModel.js'
import Product from '../models/ProductModel.js'
import User from '../models/UserModel.js'
import { mpPreference } from '../config/mercadopago.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

/** round2 — redondea a 2 decimales para evitar errores de coma flotante (0.1 + 0.2). Lo usa createOrder. */
const round2 = (n) => Math.round(n * 100) / 100

/**
 * createOrder
 * Lo llama : orderController.createOrder   (POST /api/orders — requiere sesión)
 * Recibe   : userId (token) y { items: [{id, quantity}], shippingInfo } validados por createOrderSchema.
 * Devuelve : { paymentUrl, preferenceId, orderId }
 * Errores  : 401 usuario inexistente · 404 producto inexistente · 409 stock insuficiente ·
 *            502 Mercado Pago no respondió (la orden queda "cancelled" para no dejar órdenes huérfanas).
 */
export const createOrder = async (userId, { items, shippingInfo }) => {
    const user = await User.findById(userId).select('email')
    if (!user) throw new AppError('Usuario no encontrado', 401)

    // 1) Unir ítems repetidos (mismo producto dos veces) para validar el stock sobre el TOTAL.
    const quantities = new Map()
    for (const { id, quantity } of items) {
        quantities.set(id, (quantities.get(id) ?? 0) + quantity)
    }

    // 2) Datos reales desde la BD. Esta es la corrección del problema de "precio enviado por el cliente".
    const products = await Product.find({
        _id: { $in: [...quantities.keys()] },
    })
    const byId = new Map(products.map((p) => [p.id, p]))

    const lines = []
    for (const [id, quantity] of quantities) {
        const product = byId.get(id)
        if (!product) throw new AppError(`Producto no encontrado (${id})`, 404)
        if (product.stock < quantity) {
            throw new AppError(
                `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`,
                409
            )
        }
        lines.push({ product, quantity })
    }

    const totalAmount = round2(
        lines.reduce(
            (sum, { product, quantity }) => sum + product.price * quantity,
            0
        )
    )

    // 3) Guardar la orden primero: su _id viaja a Mercado Pago como external_reference
    //    y es lo que usará el webhook para encontrarla.
    const order = await Order.create({
        userId,
        products: lines.map(({ product, quantity }) => ({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
        })),
        totalAmount,
        status: 'pending',
        shippingInfo,
        mercadoPagoData: { payerEmail: user.email },
    })

    // 4) Crear la preferencia de pago.
    try {
        const preference = await mpPreference.create({
            body: {
                items: lines.map(({ product, quantity }) => ({
                    id: product.id,
                    title: product.name, // MP exige "title" (antes se enviaba "name")
                    quantity,
                    unit_price: product.price,
                    currency_id: env.MP_CURRENCY_ID,
                    picture_url: product.imageUrl,
                })),
                payer: { email: user.email },
                external_reference: order.id, // ← vínculo orden ↔ pago (lo lee paymentService)
                back_urls: {
                    success: `${env.FRONTEND_URL}/payment/success`,
                    failure: `${env.FRONTEND_URL}/payment/failure`,
                    pending: `${env.FRONTEND_URL}/payment/pending`,
                },
                notification_url: `${env.BACKEND_URL}/api/webhook`, // ← aquí llama MP (webhookRoutes)
                metadata: { order_id: order.id },
            },
        })

        order.mercadoPagoData.preferenceId = preference.id
        await order.save()

        return {
            paymentUrl: preference.init_point,
            preferenceId: preference.id,
            orderId: order.id,
        }
    } catch (err) {
        // No dejar una orden "pending" que nunca podrá pagarse.
        order.status = 'cancelled'
        order.statusNote =
            'No se pudo crear la preferencia de pago en Mercado Pago'
        await order.save()
        console.error('❌ Error creando preferencia en Mercado Pago:', err)
        throw new AppError('No se pudo iniciar el pago, intenta de nuevo', 502)
    }
}

/**
 * listMyOrders
 * Lo llama : orderController.listMyOrders   (GET /api/orders)
 * Devuelve : las últimas 50 órdenes del usuario autenticado, más recientes primero.
 */
export const listMyOrders = async (userId) =>
    Order.find({ userId }).sort({ createdAt: -1 }).limit(50).lean()

/**
 * getOrderById
 * Lo llama : orderController.getOrder   (GET /api/orders/:id)
 * Uso típico: la página /payment/success consulta aquí el estado real de la orden
 *             (el redirect de MP NO es prueba de pago; la prueba es el webhook).
 * Errores  : 404 si no existe O si pertenece a otro usuario (no se revela que existe). Un admin puede ver cualquiera.
 */
export const getOrderById = async (orderId, { id: userId, isAdmin }) => {
    const order = await Order.findById(orderId).lean()
    if (!order || (!isAdmin && String(order.userId) !== String(userId))) {
        throw new AppError('Orden no encontrada', 404)
    }
    return order
}
