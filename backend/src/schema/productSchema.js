// E-commerce/backend/src/schema/productSchema.js

/**
 * ARCHIVO     : src/schema/productSchema.js
 * CAPA        : Validación
 * ROL         : Reglas para crear, actualizar y listar productos.
 * LO CONSUME  : routes/productRoutes.js (middleware validate).
 * LO GENERA   : datos ya validados en req.validated.{body|query}, que usa productController.
 */
import { z } from 'zod'

/** productSchema — cuerpo de POST /api/products (crear). Todos los campos son obligatorios. */
export const productSchema = z.object({
    name: z.string().trim().min(3).max(50),
    description: z.string().trim().min(10).max(500),
    // positive(): Mercado Pago rechaza ítems con precio 0, así que no se permiten productos gratis.
    price: z.number().positive(),
    stock: z.number().int().min(0),
    // Solo http/https: evita URLs tipo "javascript:..." o "data:..." guardadas como imagen.
    imageUrl: z.url({ protocol: /^https?$/ }).max(2048),
})

/**
 * productUpdateSchema — cuerpo de PUT /api/products/:id.
 * partial(): todos opcionales (actualización parcial) pero se exige al menos UN campo.
 */
export const productUpdateSchema = productSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Envía al menos un campo para actualizar',
    })

/**
 * productListQuerySchema — query de GET /api/products?page=1&limit=20
 * coerce: los query params llegan como texto ("2") y se convierten a número.
 */
export const productListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})
