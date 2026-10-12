// E-commerce/frontend/src/services/authServices.js
/**
 * ARCHIVO : src/services/authServices.js
 * CAPA    : servicios (solo red; NO tocan estado de React ni muestran toasts)
 * ROL     : endpoints de autenticación del backend (/api/auth/*).
 * LO USA  : context/UserContext.jsx (único consumidor).
 * ANTES   : loginService recibía reset/setUserInfo/setRedirect (acoplaba la red con la interfaz) y devolvía
 *           undefined si el status no era 200. Ahora cada función solo devuelve datos o lanza ApiError.
 */
import { http } from '../lib/http'

/** GET /auth/profile → usuario actual (401 si no hay sesión). */
export const getProfile = (signal) =>
  http.get('/auth/profile', { signal }).then((r) => r.data)

/** POST /auth/login → { id, username, email, isAdmin } (la cookie de sesión la pone el servidor). */
export const login = (credentials) =>
  http.post('/auth/login', credentials).then((r) => r.data)

/** POST /auth/register → { message, user }. */
export const register = (data) =>
  http.post('/auth/register', data).then((r) => r.data)

/** POST /auth/logout → el servidor borra la cookie. */
export const logout = () => http.post('/auth/logout').then((r) => r.data)
