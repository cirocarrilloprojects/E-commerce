// backend/src/config/env.js

/**
 * ARCHIVO     : src/config/env.js
 * CAPA        : Configuración
 * ROL         : Cargar el archivo .env y VALIDAR todas las variables de entorno en un solo lugar.
 *               Si falta alguna o es inválida, la app NO arranca (falla rápido y con mensaje claro).
 * LO GENERA   : dotenv (lee .env → process.env) y el esquema Zod de abajo (valida y convierte tipos).
 * LO CONSUME  : casi todo el backend: db.js, mercadopago.js, app.js, server.js, authCookie.js,
 *               authService.js, orderService.js, middlewares (authenticate, verifyOrigin, verifyMpWebhook).
 * POR QUÉ     : antes cada archivo leía process.env por su cuenta (y a veces dotenv.config() se llamaba
 *               tarde o sin importarse). Ahora hay UNA sola fuente de verdad, tipada y validada.
 */
import 'dotenv/config' // 1) carga .env en process.env (debe ejecutarse antes de validar)
import { z } from 'zod'

/**
 * envSchema — contrato de las variables de entorno.
 * Lo usa: el safeParse de más abajo.
 * Genera: un objeto con tipos correctos (PORT es número, FRONTEND_URL ya normalizada, etc.).
 */
const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),

    MONGO_URI: z.string().min(1, 'MONGO_URI es obligatoria'),

    // 32+ caracteres: un secreto corto se puede adivinar por fuerza bruta y permitiría falsificar JWT.
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),

    // new URL(v).origin elimina rutas y barra final: "http://localhost:5173/" → "http://localhost:5173".
    // Así la comparación con la cabecera Origin del navegador es exacta.
    FRONTEND_URL: z.url().transform((v) => new URL(v).origin),
    BACKEND_URL: z.url().transform((v) => v.replace(/\/+$/, '')),

    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),

    MP_ACCESS_TOKEN: z.string().min(1, 'MP_ACCESS_TOKEN es obligatoria'),
    MERCADOPAGO_WEBHOOK_SECRET: z
        .string()
        .min(1, 'MERCADOPAGO_WEBHOOK_SECRET es obligatoria'),
    MP_CURRENCY_ID: z
        .string()
        .length(3, 'Usa el código ISO de 3 letras (COP, ARS, MXN...)')
        .transform((v) => v.toUpperCase()),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas o faltantes:')
    for (const issue of parsed.error.issues) {
        console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
}

// Regla extra: los navegadores rechazan SameSite=None si la cookie no es "Secure",
// y en este proyecto "secure" solo se activa en producción (HTTPS).
if (
    parsed.data.COOKIE_SAMESITE === 'none' &&
    parsed.data.NODE_ENV !== 'production'
) {
    console.error(
        '❌ COOKIE_SAMESITE=none requiere NODE_ENV=production (cookie Secure sobre HTTPS).'
    )
    process.exit(1)
}

/**
 * env — objeto de configuración de solo lectura que importa el resto de la app.
 * Incluye dos atajos booleanos (isProduction / isDevelopment) para no repetir comparaciones de strings.
 */
export const env = Object.freeze({
    ...parsed.data,
    isProduction: parsed.data.NODE_ENV === 'production',
    isDevelopment: parsed.data.NODE_ENV === 'development',
})
