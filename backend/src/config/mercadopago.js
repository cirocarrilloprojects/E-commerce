// E-commerce/backend/src/config/mercadoPagoConfig.js

/**
 * ARCHIVO     : src/config/mercadopago.js
 * CAPA        : Configuración / integración externa
 * ROL         : Crear UNA sola vez el cliente del SDK de Mercado Pago y los "recursos" que usamos.
 * LO CONSUME  : orderService.js (mpPreference.create → genera el link de pago),
 *               paymentService.js (mpPayment.get → consulta el pago real a MP desde el webhook).
 * CONSUME     : env.js (MP_ACCESS_TOKEN).
 *
 * IMPORTANTE: el access token es un secreto de servidor. Nunca debe salir hacia el frontend.
 */
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { env } from './env.js'

// Cliente base: guarda el token y el timeout (5 s) de todas las llamadas HTTP a Mercado Pago.
const mpClient = new MercadoPagoConfig({
    accessToken: env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 },
})

/** mpPreference: crea "preferencias de pago" (el carrito que el cliente paga en el checkout de MP). */
export const mpPreference = new Preference(mpClient)

/** mpPayment: consulta un pago por id (fuente de verdad del estado real del pago). */
export const mpPayment = new Payment(mpClient)
