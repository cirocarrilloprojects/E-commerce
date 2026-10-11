// E-commerce/backend/src/middleware/authenticate.js

/**
 * ARCHIVO     : src/middleware/authenticate.js
 * CAPA        : Middleware (autenticación y autorización)
 * ROL         : Saber QUIÉN hace la petición (authenticate) y si es ADMIN (requireAdmin).
 * LO USA      : routes/cartRoutes.js, orderRoutes.js, productRoutes.js (escritura), authRoutes.js (/profile).
 * LO GENERA   : req.user = { id, isAdmin } cuando el JWT es válido.
 * LO CONSUME  : los controladores (req.user.id identifica al dueño del carrito/orden, en vez de
 *               confiar en un userId enviado por el cliente).
 * DEPENDE DE  : cookie "accessToken" que escribió authController (login/register) con setAuthCookie,
 *               y de cookie-parser (registrado en app.js) que la deja en req.cookies.
 *
 * LIMITACIÓN CONOCIDA: isAdmin viaja dentro del JWT, así que si quitas el rol a alguien, el token
 * anterior sigue valiendo hasta 1 h. Para revocación inmediata habría que consultar la BD aquí.
 */
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { ACCESS_COOKIE_NAME } from '../utils/authCookie.js'

/**
 * authenticate
 * Qué hace : lee la cookie, verifica firma y caducidad del JWT y rellena req.user.
 * Lo llama : Express, en cada ruta protegida (se declara en el router).
 * Errores  : 401 si no hay cookie o el token es inválido/expirado.
 */
export const authenticate = (req, res, next) => {
    const token = req.cookies?.[ACCESS_COOKIE_NAME]
    if (!token) return next(new AppError('No autenticado', 401))

    try {
        // algorithms: fija HS256 → impide ataques que cambian el algoritmo del token (alg:none, etc.)
        const payload = jwt.verify(token, env.JWT_SECRET, {
            algorithms: ['HS256'],
        })
        req.user = { id: payload.id, isAdmin: payload.isAdmin === true }
        next()
    } catch {
        next(new AppError('Token inválido o expirado', 401))
    }
}

/**
 * requireAdmin
 * Qué hace : permite continuar solo si el usuario autenticado es administrador.
 * Lo llama : productRoutes (POST, PUT, DELETE). SIEMPRE debe ir DESPUÉS de authenticate.
 * Errores  : 403 (autenticado pero sin permiso). Distinto de 401 (no autenticado).
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) return next(new AppError('Acceso denegado', 403))
    next()
}
