// backend/src/middleware/verifyMpWebhook.js

/**
 * ARCHIVO     : src/middleware/verifyMpWebhook.js
 * CAPA        : Middleware
 * ROL         : Puerta de entrada del webhook: solo deja pasar notificaciones con firma HMAC auténtica.
 * LO USA      : routes/webhookRoutes.js, ANTES de webhookController.
 * CONSUME     : utils/mercadoPagoSignature.js (la comprobación criptográfica) y env (el secreto).
 * LO GENERA   : AppError 401 si la firma no es válida; si es válida, deja continuar al controlador.
 *
 * Se valida la firma ANTES de mirar el contenido: no se procesa ningún dato no autenticado.
 */
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { verifyMercadoPagoSignature } from '../utils/mercadoPagoSignature.js'

export const verifyMpWebhook = (req, res, next) => {
    if (!verifyMercadoPagoSignature(req, env.MERCADOPAGO_WEBHOOK_SECRET)) {
        return next(new AppError('Firma inválida', 401))
    }
    next()
}
