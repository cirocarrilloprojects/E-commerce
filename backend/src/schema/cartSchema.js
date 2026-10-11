// E-commerce/backend/src/schema/cartSchema.js

/**
 * ARCHIVO     : src/schema/cartSchema.js
 * CAPA        : Validación
 * ROL         : Reglas de los cuerpos de las rutas del carrito.
 * LO CONSUME  : routes/cartRoutes.js (middleware validate).
 * LO GENERA   : req.validated.body para cartController.
 *
 * NOTA: el userId YA NO viaja en el cuerpo ni en la URL: sale del JWT (req.user.id).
 *       Esto elimina la vulnerabilidad IDOR (ver/modificar el carrito de otro usuario).
 */
import { z } from 'zod'
import { objectIdSchema } from './common.js'

const quantitySchema = z.number().int().min(1).max(99)

/** addItemSchema — POST /api/cart/items → { productId, quantity? (por defecto 1) } */
export const addItemSchema = z.object({
    productId: objectIdSchema,
    quantity: quantitySchema.default(1),
})

/** updateItemSchema — PUT /api/cart/items/:productId → { quantity } (para quitar usa DELETE) */
export const updateItemSchema = z.object({
    quantity: quantitySchema,
})
