// E-commerce/backend/src/server.js
/**
 * ARCHIVO     : src/server.js
 * CAPA        : Punto de entrada (el archivo que ejecuta Node: npm run dev / npm start)
 * ROL         : Conectar la base de datos, abrir el puerto HTTP y apagar todo ordenadamente.
 * CONSUME     : env (valida .env al importarse), config/db.js, app.js.
 *
 * ORDEN DE ARRANQUE: 1) env.js valida variables → 2) connectDB → 3) app.listen.
 * Si algo falla en el arranque, el proceso termina con código 1 (el orquestador lo reiniciará).
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

        /**
         * shutdown — apagado ordenado ante SIGINT (Ctrl+C) o SIGTERM (despliegues/Docker).
         * 1) deja de aceptar conexiones nuevas  2) espera a que terminen las actuales
         * 3) cierra la BD  4) sale. Si tarda más de 10 s, se fuerza la salida.
         */
        let shuttingDown = false
        const shutdown = (signal, exitCode = 0) => {
            if (shuttingDown) return
            shuttingDown = true
            console.log(`\n${signal} recibido. Cerrando servidor...`)

            setTimeout(() => process.exit(1), 10_000).unref() // .unref(): este temporizador no mantiene vivo el proceso

            server.close(async () => {
                await disconnectDB()
                process.exit(exitCode)
            })
        }

        process.on('SIGINT', () => shutdown('SIGINT'))
        process.on('SIGTERM', () => shutdown('SIGTERM'))
        // Un error asíncrono sin capturar deja la app en estado incierto: se registra y se reinicia limpio.
        process.on('unhandledRejection', (reason) => {
            console.error('❌ unhandledRejection:', reason)
            shutdown('unhandledRejection', 1)
        })
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message)
        process.exit(1)
    }
}

start()
