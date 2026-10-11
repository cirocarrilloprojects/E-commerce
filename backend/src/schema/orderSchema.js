// E-commerce/backend/src/schema/orderSchema.js

/**
 * ARCHIVO     : src/schema/orderSchema.js
 * CAPA        : Validación
 * ROL         : Reglas del cuerpo de POST /api/orders (crear orden + link de pago).
 * LO CONSUME  : routes/orderRoutes.js (middleware validate).
 * LO GENERA   : req.validated.body para orderController.createOrder.
 *
 * CLAVE DE SEGURIDAD: el cliente solo envía QUÉ productos y CUÁNTOS ({ id, quantity }).
 * NO se aceptan precio ni nombre: orderService los lee de la base de datos.
 * (Antes el cliente mandaba unit_price y podía pagar 1 peso por cualquier producto.)
 */
import { z } from 'zod'
import { objectIdSchema } from './common.js'

const text = (max = 100) => z.string().trim().min(1).max(max)

export const createOrderSchema = z.object({
    items: z
        .array(
            z.object({
                id: objectIdSchema,
                quantity: z.number().int().min(1).max(99),
            })
        )
        .min(1, 'Se requiere al menos un producto')
        .max(50),
    shippingInfo: z.object({
        firstName: text(50),
        lastName: text(50),
        phone: z.string().trim().min(7).max(20),
        address: z.object({
            street: text(100),
            number: text(20),
            city: text(60),
            state: text(60),
            zipCode: text(20),
        }),
    }),
})
