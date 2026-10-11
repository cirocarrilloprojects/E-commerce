// backend/src/app.js
/**
 * ARCHIVO     : src/app.js
 * CAPA        : Aplicación (configuración de Express, SIN abrir el puerto)
 * ROL         : Construir la app: seguridad, parsers, logging, rutas y manejo de errores.
 *               Se separa de server.js para poder importar la app en pruebas sin levantar el servidor.
 * LO CONSUME  : server.js (app.listen) y pruebas.
 * CONSUME     : env, db (isDbConnected), routes/index.js, errorHandler.
 *
 * ORDEN DE LOS MIDDLEWARES (cada petición los atraviesa de arriba hacia abajo):
 *   helmet → cors → express.json → cookieParser → morgan → /health → /api → 404 → errorHandler
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env.js'
import { isDbConnected } from './config/db.js'
import apiRouter from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Detrás de un proxy (Render, Railway, Nginx...) Express debe confiar en X-Forwarded-* para conocer la
// IP real del cliente (rate limit) y saber que la conexión es HTTPS (cookies "secure").
app.set('trust proxy', env.TRUST_PROXY)

// Cabeceras de seguridad HTTP (X-Content-Type-Options, HSTS, quita X-Powered-By, etc.)
app.use(helmet())

// CORS: solo nuestro frontend puede llamar a la API desde un navegador, y puede enviar cookies.
app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type'],
        exposedHeaders: ['X-Total-Count'], // permite al frontend leer el total de productos
    })
)

app.use(express.json({ limit: '100kb' })) // límite de tamaño del cuerpo → evita abusos de memoria
app.use(cookieParser()) // deja las cookies en req.cookies (lo lee authenticate)

// Logs de peticiones: formato corto en desarrollo, formato estándar "combined" en producción.
app.use(morgan(env.isProduction ? 'combined' : 'dev'))

/**
 * GET /health — comprobación de vida/estado.
 * Lo consumen: balanceadores, Render/Railway, monitoreo. 200 si la BD responde, 503 si no.
 */
app.get('/health', (req, res) => {
    const db = isDbConnected() ? 'connected' : 'disconnected'
    res.status(db === 'connected' ? 200 : 503).json({ status: 'ok', db })
})

app.use('/api', apiRouter)

app.use(notFoundHandler) // ninguna ruta coincidió → 404
app.use(errorHandler) // SIEMPRE el último: recoge todos los errores

export default app
