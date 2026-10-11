// E-commerce/backend/src/routes/orderRoutes.js
/**
 * ARCHIVO     : src/routes/orderRoutes.js
 * CAPA        : Rutas
 * ROL         : Endpoints de órdenes. Todos exigen sesión.
 * LO CONSUME  : routes/index.js (se monta en /api/orders).
 * CONSUME     : authenticate, validate, schema/orderSchema.js, schema/common.js, orderController.
 *
 * Equivalencia: POST /orders/create → POST /orders
 */
import { Router } from 'express'
import * as controller from '../controllers/orderController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { createOrderSchema } from '../schema/orderSchema.js'
import { idParamSchema } from '../schema/common.js'

const router = Router()

router.use(authenticate)

router.post('/', validate({ body: createOrderSchema }), controller.createOrder)
router.get('/', controller.listMyOrders)
router.get('/:id', validate({ params: idParamSchema }), controller.getOrder)

export default router
