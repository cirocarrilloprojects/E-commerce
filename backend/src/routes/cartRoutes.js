// E-commerce/backend/src/routes/cartRoutes.js
/**
 * ARCHIVO     : src/routes/cartRoutes.js
 * CAPA        : Rutas
 * ROL         : Endpoints del carrito. TODOS exigen sesión y operan sobre el carrito del usuario del token.
 * LO CONSUME  : routes/index.js (se monta en /api/cart).
 * CONSUME     : authenticate, validate, schema/cartSchema.js, schema/common.js, cartController.
 *
 * EQUIVALENCIAS con la API anterior (para actualizar el frontend):
 *   POST   /cart/add                    → POST   /cart/items
 *   GET    /cart/get/:userId            → GET    /cart
 *   PUT    /cart/update/:userId         → PUT    /cart/items/:productId
 *   DELETE /cart/removeProduct/:userId  → DELETE /cart/items/:productId
 *   DELETE /cart/clear/:userId          → DELETE /cart
 *   GET    /cart/total/:userId          → GET    /cart/total
 */
import { Router } from 'express'
import * as controller from '../controllers/cartController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { addItemSchema, updateItemSchema } from '../schema/cartSchema.js'
import { productIdParamSchema } from '../schema/common.js'

const router = Router()

router.use(authenticate) // protege TODAS las rutas de este router

router.get('/', controller.getCart)
router.get('/total', controller.getCartTotal)
router.post('/items', validate({ body: addItemSchema }), controller.addItem)
router.put(
    '/items/:productId',
    validate({ params: productIdParamSchema, body: updateItemSchema }),
    controller.updateItem
)
router.delete(
    '/items/:productId',
    validate({ params: productIdParamSchema }),
    controller.removeItem
)
router.delete('/', controller.clearCart)

export default router
