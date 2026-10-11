// E-commerce/backend/src/controllers/webhookController.js

/**
 * ARCHIVO     : src/controllers/webhookController.js
 * CAPA        : Controladores
 * ROL         : Recibir las notificaciones de Mercado Pago (ya autenticadas por verifyMpWebhook).
 * LO GENERA   : Mercado Pago (servidor a servidor) cuando cambia el estado de un pago.
 * LO CONSUME  : routes/webhookRoutes.js.
 * CONSUME     : services/paymentService.js, utils/mercadoPagoSignature.js (extractDataId).
 *
 * REGLAS DEL WEBHOOK:
 *  - Responder 2xx rápido. Cualquier otro código hace que MP REINTENTE la notificación.
 *  - Los tipos que no nos interesan (merchant_order, etc.) se responden con 200 y se ignoran:
 *    antes se respondía 400, lo que provocaba reintentos inútiles.
 *  - Se usa el id que quedó FIRMADO (el de la query), no uno distinto que pudiera venir en el body.
 */
import { processPaymentNotification } from '../services/paymentService.js'
import { extractDataId } from '../utils/mercadoPagoSignature.js'

/**
 * handlePaymentWebhook — POST /api/webhook
 * Entrada : cuerpo { type: 'payment', data: { id } } + query ?data.id=...
 * Salida  : 200 vacío cuando se procesó o se ignoró correctamente.
 */
export const handlePaymentWebhook = async (req, res) => {
    const type = req.body?.type ?? req.query?.type

    if (type !== 'payment') return res.sendStatus(200) // evento que no procesamos

    const paymentId = extractDataId(req)
    if (!paymentId) return res.sendStatus(200)

    await processPaymentNotification(paymentId)
    res.sendStatus(200)
}
