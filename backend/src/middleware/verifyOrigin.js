// backend/src/middleware/verifyOrigin.js

/**
 * ARCHIVO     : src/middleware/verifyOrigin.js
 * CAPA        : Middleware (defensa contra CSRF)
 * ROL         : Rechazar peticiones que MODIFICAN datos (POST/PUT/PATCH/DELETE) si vienen de un sitio
 *               web distinto a nuestro frontend. Como la sesión va en una cookie, un sitio malicioso
 *               podría hacer que el navegador de la víctima envíe peticiones con su cookie (CSRF).
 * LO USA      : routes/index.js (después del webhook, antes del resto de rutas).
 * CONSUME     : env.FRONTEND_URL.
 *
 * CÓMO FUNCIONA: los navegadores adjuntan la cabecera "Origin" en peticiones cross-site y NO permiten
 * a una página falsificarla. Si Origin existe y no es nuestro frontend → 403.
 * Si no hay Origin (curl, REST Client, servidor a servidor) se permite: un atacante CSRF
 * siempre opera desde un navegador, que sí la envía.
 *
 * EL WEBHOOK SE EXCLUYE: lo llama Mercado Pago (servidor), no un navegador; se protege con firma HMAC.
 */
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']) // no modifican datos → no requieren comprobación

export const verifyOrigin = (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next()

    const origin = req.get('origin')
    if (origin && origin !== env.FRONTEND_URL) {
        return next(new AppError('Origen no permitido', 403))
    }
    next()
}
