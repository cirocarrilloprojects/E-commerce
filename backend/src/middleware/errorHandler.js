// E-commerce/backend/src/middleware/errorHandler.js

/**
 * ARCHIVO     : src/middleware/errorHandler.js
 * CAPA        : Middleware (manejo CENTRALIZADO de errores)
 * ROL         : Único lugar donde un error se convierte en respuesta HTTP. Los servicios y controladores
 *               solo hacen  throw ...  y no se preocupan por el formato de la respuesta.
 * LO GENERA   : errores lanzados por: AppError (servicios/middlewares), Zod (middleware validate),
 *               Mongoose (CastError, ValidationError, código 11000), body-parser (JSON mal formado).
 * LO CONSUME  : app.js, que lo registra AL FINAL de todos los middlewares y rutas.
 *
 * FORMATO ÚNICO de error para el frontend:  { "error": "mensaje", "details": [...] (opcional) }
 *
 * SEGURIDAD: los errores 5xx NUNCA devuelven su mensaje real (podría revelar rutas, consultas o
 * credenciales); se registran en consola y el cliente solo ve "Error interno del servidor".
 * El stack trace solo se envía en desarrollo.
 *
 * Express 5 detecta los errores de funciones async automáticamente (no hace falta try/catch ni
 * wrappers) y los envía aquí.
 */
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

/**
 * notFoundHandler
 * Qué hace : se ejecuta cuando ninguna ruta coincidió y genera un AppError 404.
 * Lo llama : Express, al final de la cadena (registrado en app.js justo antes de errorHandler).
 * Genera   : AppError(404) → lo recoge errorHandler.
 */
export const notFoundHandler = (req, res, next) => {
    next(
        new AppError(
            `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
            404
        )
    )
}

/**
 * errorHandler
 * Qué hace : traduce cualquier error a { status, body } según su tipo.
 * Lo llama : Express (middleware de 4 parámetros = manejador de errores).
 * Recibe   : err (lo que se lanzó), req, res, next.
 * Genera   : la respuesta JSON de error que consume el frontend.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    // Si ya se empezó a enviar la respuesta, delegamos en el manejador por defecto de Express.
    if (res.headersSent) return next(err)

    let status = 500
    let message = 'Error interno del servidor'
    let details

    if (err instanceof ZodError) {
        // Datos de entrada inválidos (middleware validate)
        status = 400
        message = 'Datos inválidos'
        details = err.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
        }))
    } else if (err instanceof AppError) {
        // Error de negocio esperado (404, 409, 401...)
        status = err.status
        message = err.status < 500 ? err.message : 'Error interno del servidor'
        details = err.status < 500 ? err.details : undefined
    } else if (err?.name === 'CastError') {
        // ID de Mongo mal formado que se coló sin validar
        status = 400
        message = 'ID inválido'
    } else if (err?.name === 'ValidationError') {
        // Validación del esquema de Mongoose (segunda línea de defensa tras Zod)
        status = 400
        message = 'Datos inválidos'
        details = Object.values(err.errors ?? {}).map((e) => ({
            field: e.path,
            message: e.message,
        }))
    } else if (err?.code === 11000) {
        // Violación de índice único (email repetido, carrito duplicado...)
        status = 409
        message = 'El recurso ya existe'
    } else if (err?.expose === true && err.status >= 400 && err.status < 500) {
        // Errores 4xx "seguros" de body-parser: JSON mal formado (400), body demasiado grande (413)
        status = err.status
        message =
            err.type === 'entity.parse.failed'
                ? 'JSON mal formado'
                : err.message
    }

    // Solo los 5xx se registran como error (los 4xx son culpa del cliente y serían ruido).
    if (status >= 500) console.error('❌ Error no controlado:', err)

    res.status(status).json({
        error: message,
        ...(details && { details }),
        ...(env.isDevelopment && status >= 500 && { stack: err?.stack }),
    })
}
