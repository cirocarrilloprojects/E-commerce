// backend/src/utils/AppError.js

/**
 * ARCHIVO     : src/utils/AppError.js
 * CAPA        : Utilidades
 * ROL         : Error "esperado" que lleva consigo un código HTTP y un mensaje seguro para el cliente.
 *               Diferencia los errores de negocio (404, 409, 401...) de los errores inesperados (bugs → 500).
 * LO GENERA   : cualquier servicio o middleware con  throw new AppError('mensaje', 404).
 * LO CONSUME  : middleware/errorHandler.js, que lo convierte en la respuesta JSON { error, details? }.
 *
 * Ejemplo:  throw new AppError('Producto no encontrado', 404)
 */
export class AppError extends Error {
    /**
     * @param {string} message  Texto que verá el cliente (no pongas datos sensibles).
     * @param {number} status   Código HTTP (400, 401, 403, 404, 409, 429, 502...). Por defecto 500.
     * @param {any}    details  Información opcional extra (por ejemplo, lista de campos inválidos).
     */
    constructor(message, status = 500, details = undefined) {
        super(message)
        this.name = 'AppError'
        this.status = status
        this.details = details
    }
}
