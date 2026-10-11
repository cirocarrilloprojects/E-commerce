// E-commerce/backend/src/routes/index.js

/**
 * ARCHIVO     : src/routes/index.js
 * CAPA        : Rutas (router raíz de la API)
 * ROL         : Ensamblar todos los routers bajo /api y fijar el ORDEN de los filtros globales.
 * LO CONSUME  : app.js → app.use('/api', apiRouter).
 * CONSUME     : todos los routers de este directorio + verifyOrigin + apiLimiter.
 *
 * ORDEN (importa mucho en Express):
 *   1. /webhook      → sin verifyOrigin ni rate limit (lo llama Mercado Pago; se protege con su firma)
 *   2. verifyOrigin  → defensa CSRF para todo lo demás
 *   3. apiLimiter    → límite general por IP
 *   4. resto de rutas
 */
import { Router } from 'express'
import authRoutes from './authRoutes.js'
import productRoutes from './productRoutes.js'
import cartRoutes from './cartRoutes.js'
import orderRoutes from './orderRoutes.js'
import webhookRoutes from './webhookRoutes.js'
import { verifyOrigin } from '../middleware/verifyOrigin.js'
import { apiLimiter } from '../middleware/rateLimiters.js'

const router = Router()

router.use('/webhook', webhookRoutes)

router.use(verifyOrigin)
router.use(apiLimiter)

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)

export default router
