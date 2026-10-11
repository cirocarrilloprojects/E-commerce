// E-commerce/backend/src/server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { connectDB, disconnectDB } from './config/configdb.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
// 1. Validar variables de entorno
const REQUIRED_ENV = [
    'JWT_SECRET',
    'MONGO_DB_URI',
    'MONGO_DB_USER',
    'MONGO_DB_PASSWORD',
    'MONGO_DB_NAME',
]
const missing = REQUIRED_ENV.filter((k) => !process.env[k])
if (missing.length > 0) {
    console.error(`❌ Faltan variables de entorno: ${missing.join(', ')}`)
    process.exit(1)
}

// 2. Crear app
const app = express()
const PORT = process.env.PORT || 3000

// 3. Middlewares globales (en orden)
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
)
app.use(cookieParser())
app.use(express.json())
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// 4. Rutas
app.get('/health', (req, res) => {
    const db =
        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    res.status(db === 'connected' ? 200 : 503).json({ status: 'ok', db })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
// 5. 404
app.use((req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` })
})

// 6. Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err)
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON mal formado' })
    }
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
})

// 7. Arranque
const start = async () => {
    try {
        await connectDB()
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`)
        })

        const shutdown = async (signal) => {
            console.log(`\n${signal} recibido. Cerrando servidor...`)
            server.close(async () => {
                await disconnectDB()
                process.exit(0)
            })
            setTimeout(() => process.exit(1), 10000)
        }

        process.on('SIGINT', () => shutdown('SIGINT'))
        process.on('SIGTERM', () => shutdown('SIGTERM'))
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message)
        process.exit(1)
    }
}

start()
