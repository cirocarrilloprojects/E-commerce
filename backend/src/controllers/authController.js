// E-commerce/backend/src/controllers/authController.js

/**
 * ARCHIVO     : src/controllers/authController.js
 * CAPA        : Controladores (capa HTTP: traducen req → servicio → res)
 * ROL         : Recibir la petición ya validada, llamar a authService y responder con el status correcto.
 *               NO contiene lógica de negocio ni acceso a la BD.
 * LO CONSUME  : routes/authRoutes.js (cada función se asocia a una ruta).
 * CONSUME     : services/authService.js, utils/authCookie.js.
 * LO GENERA   : la respuesta JSON y la cookie de sesión que consume el frontend.
 *
 * Express 5 captura los errores de funciones async → no hace falta try/catch (los maneja errorHandler).
 */
import * as authService from '../services/authService.js'
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie.js'

/**
 * register — POST /api/auth/register
 * Entrada : req.validated.body = { username, email, password }
 * Salida  : 201 { message, user } + cookie httpOnly con el JWT.
 * Cambio  : ya NO se devuelve el token en el cuerpo (iría contra el propósito de la cookie httpOnly).
 */
export const register = async (req, res) => {
    const { user, token } = await authService.registerUser(req.validated.body)
    setAuthCookie(res, token)
    res.status(201).json({ message: 'Usuario registrado exitosamente', user })
}

/**
 * login — POST /api/auth/login
 * Entrada : req.validated.body = { email, password }
 * Salida  : 200 con el usuario público + cookie httpOnly con el JWT.
 */
export const login = async (req, res) => {
    const { user, token } = await authService.loginUser(req.validated.body)
    setAuthCookie(res, token)
    res.status(200).json(user)
}

/**
 * profile — GET /api/auth/profile   (ruta protegida por authenticate)
 * Entrada : req.user.id (lo puso authenticate).
 * Salida  : 200 con el usuario actual. El frontend lo usa al cargar la app para saber si hay sesión.
 */
export const profile = async (req, res) => {
    const user = await authService.getProfile(req.user.id)
    res.status(200).json(user)
}

/**
 * logout — POST /api/auth/logout
 * Salida  : 200 y borra la cookie.
 * Nota    : el JWT es "stateless": al cerrar sesión se borra la cookie del navegador, pero el token
 *           sigue siendo técnicamente válido hasta que expire (1 h). Para invalidarlo antes se necesitaría
 *           una lista de tokens revocados.
 */
export const logout = (req, res) => {
    clearAuthCookie(res)
    res.status(200).json({ message: 'Sesión cerrada' })
}
