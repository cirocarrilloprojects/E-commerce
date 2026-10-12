// E-commerce/backend/src/server.js
/**
 * ARCHIVO     : src/server.js
 * CAPA        : Punto de entrada (el archivo que ejecuta Node: npm run dev / npm start)
 * ROL         : Conectar la base de datos, abrir el puerto HTTP y apagar todo ordenadamente.
 * CONSUME     : env (valida .env al importarse), config/db.js, app.js.
 *
 * ORDEN DE ARRANQUE: 1) env.js valida variables → 2) connectDB → 3) app.listen.
 * Si algo falla en el arranque, el proceso termina con código 1 (el orquestador lo reiniciará).
 * CAMBIO: el handler de unhandledRejection ya NO mata el proceso en desarrollo (solo loguea).
 *         En producción sí hace shutdown limpio (el orquestador lo reiniciará).
 */
import { env } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'
import app from './app.js'

const start = async () => {
    try {
        await connectDB()

        const server = app.listen(env.PORT, () => {
            console.log(
                `🚀 Servidor escuchando en el puerto ${env.PORT} (${env.NODE_ENV})`
            )
        })

        let shuttingDown = false
        const shutdown = (signal, exitCode = 0) => {
            if (shuttingDown) return
            shuttingDown = true
            console.log(`\n${signal} recibido. Cerrando servidor...`)

            setTimeout(() => process.exit(1), 10_000).unref()

            server.close(async () => {
                await disconnectDB()
                process.exit(exitCode)
            })
        }

        process.on('SIGINT', () => shutdown('SIGINT'))
        process.on('SIGTERM', () => shutdown('SIGTERM'))

        // En desarrollo: solo avisar, no matar el proceso (evita reinicios constantes por bugs menores).
        // En producción: shutdown limpio → el orquestador reinicia el proceso.
        process.on('unhandledRejection', (reason) => {
            console.error('❌ unhandledRejection:', reason)
            if (env.isProduction) shutdown('unhandledRejection', 1)
        })

        // NUEVO: también capturamos errores síncronos no atrapados.
        process.on('uncaughtException', (err) => {
            console.error('❌ uncaughtException:', err)
            if (env.isProduction) shutdown('uncaughtException', 1)
        })
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message)
        process.exit(1)
    }
}

start()
