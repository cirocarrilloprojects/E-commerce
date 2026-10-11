// E-commerce/backend/src/schema/common.js

/**
 * ARCHIVO     : src/schema/common.js
 * CAPA        : Validación (esquemas Zod reutilizables)
 * ROL         : Piezas comunes de validación que comparten varios esquemas.
 * LO CONSUME  : cartSchema, productSchema, orderSchema, routes/*.js (params), paymentService.js (regex).
 *
 * POR QUÉ VALIDAR IDs: un ObjectId mal formado produciría CastError (→ 500 si no se controla) y
 * un valor tipo objeto { "$ne": null } podría intentar una inyección NoSQL. Con Zod garantizamos
 * que SIEMPRE llega un string de 24 caracteres hexadecimales.
 */
import { z } from 'zod'

/** Expresión regular de un ObjectId de MongoDB (24 hex). También la usa paymentService. */
export const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i

/** objectIdSchema — un id de MongoDB válido. */
export const objectIdSchema = z.string().regex(OBJECT_ID_REGEX, 'ID inválido')

/** idParamSchema — valida /:id en la URL. Lo usan productRoutes y orderRoutes. */
export const idParamSchema = z.object({ id: objectIdSchema })

/** productIdParamSchema — valida /:productId en la URL. Lo usa cartRoutes. */
export const productIdParamSchema = z.object({ productId: objectIdSchema })
