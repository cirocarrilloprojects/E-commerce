// E-commerce/backend/src/middleware/validate.js

/**
 * ARCHIVO     : src/middleware/validate.js
 * CAPA        : Middleware
 * ROL         : Validar y limpiar body / params / query con esquemas Zod ANTES de llegar al controlador.
 * LO USA      : routes/*.js →  router.post('/', validate({ body: miEsquema }), controlador)
 * LO GENERA   : req.validated = { body, params, query } con los datos ya validados, convertidos de tipo
 *               y SIN campos desconocidos.
 * LO CONSUME  : los controladores (leen SIEMPRE req.validated, nunca req.body directamente).
 *
 * ¿Por qué req.validated y no sobrescribir req.query?
 *   En Express 5 req.query es de solo lectura (getter), así que guardamos todo en un objeto propio.
 *
 * Si un esquema falla, Zod lanza ZodError → Express 5 lo envía a errorHandler → respuesta 400.
 */

/**
 * validate
 * @param {{ body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }} schemas  Esquemas por cada parte.
 * @returns {Function} middleware (req, res, next)
 */
export const validate = (schemas) => (req, res, next) => {
    req.validated = {
        // En Express 5 req.body es undefined si no hubo cuerpo → se usa {} para que Zod reporte campos faltantes.
        body: schemas.body ? schemas.body.parse(req.body ?? {}) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
    }
    next()
}
