// backend/src/utils/authCookie.js

/**
 * ARCHIVO     : src/utils/authCookie.js
 * CAPA        : Utilidades
 * ROL         : Centralizar TODO lo relacionado con la cookie que transporta el JWT.
 *               Así register, login y logout usan exactamente las mismas opciones
 *               (si difieren, el navegador no borra la cookie al hacer logout).
 * LO GENERA   : constantes y funciones que escriben/borran la cookie en la respuesta HTTP.
 * LO CONSUME  : authController (setAuthCookie / clearAuthCookie), authenticate.js (ACCESS_COOKIE_NAME),
 *               authService.js (ACCESS_TOKEN_TTL_MS para la expiración del JWT).
 */
import { env } from '../config/env.js'

/** Nombre de la cookie. La lee authenticate.js en cada petición protegida. */
export const ACCESS_COOKIE_NAME = 'accessToken'

/** Vida del token: 1 hora. El JWT y la cookie caducan juntos. */
export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000

/**
 * baseOptions — opciones comunes de la cookie.
 *  httpOnly : JavaScript del navegador NO puede leerla (protege contra robo por XSS).
 *  secure   : solo viaja por HTTPS (activo en producción).
 *  sameSite : controla si se envía en peticiones entre sitios (defensa contra CSRF). Viene de .env.
 */
const baseOptions = () => ({
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.COOKIE_SAMESITE,
    path: '/',
})

/** setAuthCookie — guarda el JWT en la cookie. Lo llama authController (register y login). */
export const setAuthCookie = (res, token) =>
    res.cookie(ACCESS_COOKIE_NAME, token, {
        ...baseOptions(),
        maxAge: ACCESS_TOKEN_TTL_MS,
    })

/** clearAuthCookie — borra la cookie. Lo llama authController (logout). */
export const clearAuthCookie = (res) =>
    res.clearCookie(ACCESS_COOKIE_NAME, baseOptions())
