// E-commerce/backend/src/routes/webhookRoutes.js
/**
 * ARCHIVO     : src/routes/webhookRoutes.js
 * CAPA        : Rutas
 * ROL         : Endpoint que llama MERCADO PAGO (no el frontend) para informar cambios de pago.
 * LO CONSUME  : routes/index.js (se monta en /api/webhook ANTES de verifyOrigin y del rate limit general,
 *               porque MP no es un navegador y puede enviar ráfagas legítimas).
 * CONSUME     : verifyMpWebhook (firma HMAC), webhookController.
 * URL que se registra en MP: la arma orderService como  BACKEND_URL + "/api/webhook"  (notification_url).
 */
import { Router } from 'express'
import { handlePaymentWebhook } from '../controllers/webhookController.js'
import { verifyMpWebhook } from '../middleware/verifyMpWebhook.js'

const router = Router()

router.post('/', verifyMpWebhook, handlePaymentWebhook)

export default router
