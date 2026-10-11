// backend/src/config/db.js

/**
 * ARCHIVO     : src/config/db.js
 * CAPA        : Configuración / acceso a datos
 * ROL         : Abrir y cerrar la conexión con MongoDB (Mongoose) y exponer su estado.
 * LO CONSUME  : server.js (connectDB al arrancar, disconnectDB al apagar),
 *               app.js (isDbConnected para la ruta /health), scripts/createAdmin.js.
 * CONSUME     : env.js (MONGO_URI).
 *
 * SOBRE EL "POOL" DE CONEXIONES:
 *   Mongoose/driver de MongoDB ya mantiene un pool de conexiones reutilizables dentro de UNA sola
 *   conexión global (mongoose.connect se llama una vez). Aquí solo lo dimensionamos con maxPoolSize.
 */
import mongoose from 'mongoose'
import { env } from './env.js'

/**
 * connectDB
 * Qué hace : abre la conexión (con pool de máx. 10 sockets) y falla en 5 s si el servidor no responde.
 * Lo llama : server.js → start() y scripts/createAdmin.js.
 * Genera   : la conexión global de Mongoose que usan TODOS los modelos (UserModel, ProductModel...).
 */
export const connectDB = async () => {
    await mongoose.connect(env.MONGO_URI, {
        maxPoolSize: 10, // máximo de conexiones simultáneas hacia Mongo
        serverSelectionTimeoutMS: 5000, // no quedarse colgado eternamente si Mongo no está disponible
    })
    console.log('✅ Conectado a MongoDB')
}

/**
 * disconnectDB
 * Qué hace : cierra la conexión de forma ordenada.
 * Lo llama : server.js → shutdown() (al recibir SIGINT/SIGTERM) y scripts/createAdmin.js.
 */
export const disconnectDB = async () => {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
}

/**
 * isDbConnected
 * Qué hace : indica si la conexión está activa (readyState 1 = connected).
 * Lo llama : app.js → GET /health.
 */
export const isDbConnected = () => mongoose.connection.readyState === 1
