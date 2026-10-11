// E-commerce/backend/src/routes/authRoutes.js
/**
 * ARCHIVO     : src/routes/authRoutes.js
 * CAPA        : Rutas (mapa URL → cadena de middlewares → controlador)
 * ROL         : Declarar los endpoints de autenticación y qué filtros pasa cada uno, EN ORDEN.
 * LO CONSUME  : routes/index.js (se monta en /api/auth).
 * CONSUME     : middleware (rateLimiters, validate, authenticate), schema/authSchema.js, authController.
 *
 * Cadena típica:  límite de intentos → validación Zod → controlador
 */
import { Router } from 'express'
import {
    register,
    login,
    logout,
    profile,
} from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimiters.js'
import { registerSchema, loginSchema } from '../schema/authSchema.js'

const router = Router()

router.post(
    '/register',
    registerLimiter,
    validate({ body: registerSchema }),
    register
)
router.post('/login', loginLimiter, validate({ body: loginSchema }), login)
router.post('/logout', logout)
router.get('/profile', authenticate, profile)

export default router
