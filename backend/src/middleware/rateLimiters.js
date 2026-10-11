// E-commerce/backend/src/middleware/rateLimiters.js

/**
 * ARCHIVO     : src/middleware/rateLimiters.js
 * CAPA        : Middleware (protección contra abuso / fuerza bruta)
 * ROL         : Limitar cuántas peticiones puede hacer una misma IP en una ventana de tiempo.
 * LO USA      : routes/index.js (apiLimiter global) y routes/authRoutes.js (loginLimiter, registerLimiter).
 * LO GENERA   : cuando se excede el límite, un AppError 429 que recoge errorHandler.
 *               Además añade cabeceras RateLimit-* para que el cliente sepa cuánto le queda.
 *
 * NOTA: el contador vive en memoria del proceso. Con varias instancias del servidor (balanceador)
 * habría que usar un almacén compartido (Redis). Para un solo servidor es suficiente.
 * Detrás de un proxy hay que configurar TRUST_PROXY en .env, o todas las peticiones parecerán de la misma IP.
 */
import { rateLimit } from 'express-rate-limit'
import { AppError } from '../utils/AppError.js'

/** build — fábrica interna: crea un limitador con el mismo formato de error que el resto de la API. */
const build = ({ windowMs, limit, message, ...extra }) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (req, res, next) => next(new AppError(message, 429)),
        ...extra,
    })

/** apiLimiter — tope general para toda la API: 300 peticiones / 15 min por IP. */
export const apiLimiter = build({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
})

/** loginLimiter — 10 intentos FALLIDOS / 15 min por IP (frena la fuerza bruta de contraseñas). */
export const loginLimiter = build({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Demasiados intentos de inicio de sesión, intenta en 15 minutos',
    skipSuccessfulRequests: true, // los logins correctos no consumen el cupo
})

/** registerLimiter — 10 registros / hora por IP (frena la creación masiva de cuentas). */
export const registerLimiter = build({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: 'Demasiados registros desde esta IP, intenta más tarde',
})
