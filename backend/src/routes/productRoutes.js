// E-commerce/backend/src/routes/productRoutes.js

/**
 * ARCHIVO     : src/routes/productRoutes.js
 * CAPA        : Rutas
 * ROL         : Endpoints del catálogo. Lectura pública; escritura SOLO para administradores
 *               (antes el comentario decía "solo administradores" pero no había ninguna protección).
 * LO CONSUME  : routes/index.js (se monta en /api/products).
 * CONSUME     : authenticate + requireAdmin, validate, schema/productSchema.js, schema/common.js, productController.
 *
 * Cadena de escritura:  authenticate (¿quién eres?) → requireAdmin (¿puedes?) → validate (¿datos válidos?) → controlador
 */
import { Router } from 'express'
import * as controller from '../controllers/productController.js'
import { authenticate, requireAdmin } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import {
    productSchema,
    productUpdateSchema,
    productListQuerySchema,
} from '../schema/productSchema.js'
import { idParamSchema } from '../schema/common.js'

const router = Router()

// Públicas
router.get(
    '/',
    validate({ query: productListQuerySchema }),
    controller.listProducts
)
router.get('/:id', validate({ params: idParamSchema }), controller.getProduct)

// Solo administradores
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate({ body: productSchema }),
    controller.createProduct
)
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate({ params: idParamSchema, body: productUpdateSchema }),
    controller.updateProduct
)
router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    validate({ params: idParamSchema }),
    controller.deleteProduct
)

export default router
