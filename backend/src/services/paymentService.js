// E-commerce/backend/src/services/paymentService.js

/**
 * ARCHIVO     : src/services/paymentService.js
 * CAPA        : Servicios (la parte más delicada: dinero + inventario)
 * ROL         : Procesar las notificaciones de pago de Mercado Pago: consultar el pago real, actualizar la
 *               orden y descontar el stock de forma ATÓMICA e IDEMPOTENTE.
 * LO CONSUME  : controllers/webhookController.js (processPaymentNotification).
 * CONSUME     : config/mercadopago.js (mpPayment), models Order y Product, mongoose (transacciones).
 * LO GENERA   : cambios en la BD: Order.status / datos de pago y Product.stock.
 *               Su "origen" es Mercado Pago → POST /api/webhook → verifyMpWebhook → webhookController.
 *
 * PROBLEMAS DEL CÓDIGO ORIGINAL QUE RESUELVE:
 *  - No era idempotente: MP reenvía notificaciones y el stock se descontaba dos veces.
 *      → si la orden ya está en estado final se ignora la notificación.
 *  - Si faltaba stock a mitad del bucle, ya se había descontado el de otros productos.
 *      → todo ocurre en una TRANSACCIÓN: o se aplica completo o no se aplica nada.
 *  - Condición de carrera (leer stock y luego escribirlo).
 *      → descuento atómico:  updateOne({stock >= cantidad}, {$inc: -cantidad}).
 *  - Cualquier estado distinto de "approved" marcaba la orden como "rejected" (incluso pending/in_process).
 *      → tabla PAYMENT_TO_ORDER_STATUS.
 *  - No comparaba el monto pagado con el de la orden.
 *
 * REQUISITO: las transacciones de MongoDB necesitan un replica set (MongoDB Atlas ya lo es).
 * Un mongod local "suelto" debe iniciarse con --replSet para soportarlas.
 */
import mongoose from 'mongoose'
import Order from '../models/OrderModel.js'
import Product from '../models/ProductModel.js'
import { mpPayment } from '../config/mercadopago.js'
import { OBJECT_ID_REGEX } from '../schema/common.js'
import { AppError } from '../utils/AppError.js'

/**
 * PAYMENT_TO_ORDER_STATUS — traduce el estado de Mercado Pago al estado de NUESTRA orden.
 * Si el estado de MP no está aquí (refunded, charged_back...), no se cambia el estado de la orden
 * (solo se guarda el estado crudo en mercadoPagoData.paymentStatus).
 */
const PAYMENT_TO_ORDER_STATUS = {
    approved: 'approved',
    pending: 'pending',
    in_process: 'in_process',
    authorized: 'in_process',
    in_mediation: 'in_process',
    rejected: 'rejected',
    cancelled: 'cancelled',
}

/** Estados finales: una vez ahí, nuevas notificaciones se ignoran (idempotencia y orden de llegada). */
const FINAL_ORDER_STATUSES = new Set(['approved', 'needs_review'])

/** Error interno: no hay stock suficiente para algún ítem. Lo lanza decrementStock, lo atrapa applyPaymentToOrder. */
class InsufficientStockError extends Error {}

/** Error interno: el monto pagado no coincide con el total de la orden. Lo atrapa applyPaymentToOrder. */
class PaymentMismatchError extends Error {}

/**
 * copyPaymentData
 * Qué hace : copia al documento de la orden los datos del pago que informó Mercado Pago.
 * Lo llama : applyPaymentToOrder y flagOrderForReview.
 */
const copyPaymentData = (order, payment) => {
    order.mercadoPagoData.paymentId = String(payment.id)
    order.mercadoPagoData.paymentStatus = payment.status
    order.mercadoPagoData.transactionAmount = payment.transaction_amount
    order.mercadoPagoData.paymentMethodId = payment.payment_method_id
    if (payment.date_approved)
        order.mercadoPagoData.paidAt = new Date(payment.date_approved)
}

/**
 * decrementStock
 * Qué hace : descuenta el stock de cada producto de la orden DENTRO de la transacción recibida.
 *            La condición "stock >= cantidad" y el $inc ocurren en una sola operación atómica,
 *            por lo que dos compras simultáneas nunca pueden dejar el stock en negativo.
 * Lo llama : applyPaymentToOrder (solo cuando el pago está aprobado).
 * Lanza    : InsufficientStockError (revierte la transacción completa).
 */
const decrementStock = async (orderProducts, session) => {
    for (const item of orderProducts) {
        const result = await Product.updateOne(
            { _id: item.productId, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
        )
        if (result.modifiedCount === 0) {
            throw new InsufficientStockError(
                `Sin stock suficiente (o producto eliminado): ${item.name}`
            )
        }
    }
}

/**
 * flagOrderForReview
 * Qué hace : marca la orden como "needs_review" cuando el dinero YA fue cobrado pero no se pudo
 *            completar la venta (sin stock o monto distinto). Una persona debe reembolsar o resolver.
 * Lo llama : applyPaymentToOrder (en su catch), DESPUÉS de que la transacción fue revertida.
 * Devuelve : nada; deja un console.error para que sea visible en los logs.
 */
const flagOrderForReview = async (orderId, payment, reason) => {
    const order = await Order.findById(orderId)
    if (!order || FINAL_ORDER_STATUSES.has(order.status)) return

    copyPaymentData(order, payment)
    order.status = 'needs_review'
    order.statusNote = reason
    await order.save()

    console.error(
        `⚠️  Orden ${orderId} requiere revisión manual (pago ${payment.id}): ${reason}`
    )
}

/**
 * applyPaymentToOrder
 * Qué hace : aplica el resultado de UN pago a su orden.
 * Lo llama : processPaymentNotification (abajo).
 * Recibe   : payment — el objeto devuelto por Mercado Pago (id, status, external_reference, transaction_amount...).
 * Pasos    : 1) ubica la orden por external_reference
 *            2) si ya está en estado final → ignora (idempotencia)
 *            3) copia datos de pago y estado
 *            4) si está aprobado: valida monto y descuenta stock
 *            5) guarda — todo dentro de una transacción
 */
export const applyPaymentToOrder = async (payment) => {
    const orderId = payment.external_reference

    // Pagos que no pertenecen a nuestras órdenes (otra integración, pruebas del panel de MP...) → se ignoran.
    if (!orderId || !OBJECT_ID_REGEX.test(orderId)) {
        console.warn(`Pago ${payment.id} ignorado: external_reference inválido`)
        return
    }

    const newStatus = PAYMENT_TO_ORDER_STATUS[payment.status] // puede ser undefined (estado no mapeado)
    const session = await mongoose.startSession()

    try {
        // withTransaction puede REPETIR el callback si hay un error transitorio → el callback debe ser repetible.
        await session.withTransaction(async () => {
            const order = await Order.findById(orderId).session(session)

            if (!order) {
                console.warn(
                    `Pago ${payment.id}: orden ${orderId} no encontrada`
                )
                return
            }
            if (FINAL_ORDER_STATUSES.has(order.status)) return // ya procesada → idempotente

            copyPaymentData(order, payment)
            if (newStatus) order.status = newStatus

            if (newStatus === 'approved') {
                if (
                    Math.abs(payment.transaction_amount - order.totalAmount) >
                    0.01
                ) {
                    throw new PaymentMismatchError(
                        `Monto pagado (${payment.transaction_amount}) distinto al total de la orden (${order.totalAmount})`
                    )
                }
                await decrementStock(order.products, session)
            }

            await order.save({ session })
        })
    } catch (err) {
        if (
            err instanceof InsufficientStockError ||
            err instanceof PaymentMismatchError
        ) {
            // La transacción ya se revirtió. Se registra el caso en la orden (fuera de la transacción)
            // y se responde 200 a MP: reintentar NO lo arreglaría.
            await flagOrderForReview(orderId, payment, err.message)
            return
        }
        throw err
    } finally {
        await session.endSession()
    }
}

/**
 * processPaymentNotification
 * Lo llama : webhookController.handlePaymentWebhook
 * Recibe   : paymentId (string) tomado de la notificación ya autenticada.
 * Hace     : NO confía en el contenido del webhook: vuelve a pedirle a Mercado Pago el pago real
 *            (mpPayment.get) y recién entonces actualiza la orden.
 * Errores  : 502 si MP no responde (el controlador responde error y MP reintentará más tarde).
 */
export const processPaymentNotification = async (paymentId) => {
    let payment
    try {
        payment = await mpPayment.get({ id: paymentId })
    } catch (err) {
        // 404: id inexistente (típico de las "notificaciones de prueba" del panel de MP) → se ignora.
        if (err?.status === 404 || err?.statusCode === 404) {
            console.warn(
                `Pago ${paymentId} no existe en Mercado Pago; notificación ignorada`
            )
            return
        }
        console.error('❌ Error consultando el pago en Mercado Pago:', err)
        throw new AppError('No se pudo consultar el pago en Mercado Pago', 502)
    }

    await applyPaymentToOrder(payment)
}
