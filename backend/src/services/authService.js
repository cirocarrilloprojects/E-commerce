// E-commerce/backend/src/services/authService.js

/**
 * ARCHIVO     : src/services/authService.js
 * CAPA        : Servicios (lógica de negocio de autenticación)
 * ROL         : Registrar usuarios, validar credenciales, firmar el JWT y devolver el perfil.
 * LO CONSUME  : controllers/authController.js (único cliente de este servicio).
 * CONSUME     : models/UserModel.js (datos), bcryptjs (hash), jsonwebtoken (token), env, AppError.
 * LO GENERA   : objetos "usuario público" { id, username, email, isAdmin } y el JWT que el controlador
 *               guarda en la cookie (setAuthCookie).
 *
 * El servicio NO sabe nada de HTTP (no usa req/res): recibe datos simples y devuelve datos simples
 * o lanza AppError. Eso lo hace reutilizable y fácil de probar.
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/UserModel.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { ACCESS_TOKEN_TTL_MS } from '../utils/authCookie.js'

// Coste de bcrypt: cada +1 duplica el tiempo de cálculo. 12 es un buen equilibrio actual.
const BCRYPT_ROUNDS = 12

/**
 * DUMMY_HASH — hash falso calculado al arrancar.
 * Se usa en loginUser cuando el email NO existe, para que la comparación tarde lo mismo que con un
 * usuario real. Sin esto, un atacante mediría los tiempos de respuesta y descubriría qué emails están registrados.
 */
const DUMMY_HASH = bcrypt.hashSync('contraseña-ficticia-no-usar', BCRYPT_ROUNDS)

/**
 * toPublicUser
 * Qué hace : reduce un documento de usuario a los campos que se pueden mostrar.
 * Lo llama : registerUser, loginUser, getProfile (abajo).
 * Genera   : el objeto "user" que ve el frontend (nunca incluye el hash de la contraseña).
 */
const toPublicUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
})

/**
 * signAccessToken
 * Qué hace : crea un JWT firmado (HS256) con { id, isAdmin } que caduca en 1 hora.
 * Lo llama : registerUser y loginUser.
 * Lo consume: authenticate.js lo verifica en cada petición protegida.
 */
const signAccessToken = (user) =>
    jwt.sign({ id: user.id, isAdmin: user.isAdmin }, env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: ACCESS_TOKEN_TTL_MS / 1000, // jsonwebtoken espera segundos
    })

/**
 * registerUser
 * Lo llama : authController.register
 * Recibe   : { username, email, password } ya validados por registerSchema.
 * Hace     : comprueba que el email esté libre → hashea la contraseña → crea el usuario (NUNCA admin).
 * Devuelve : { user, token }
 * Errores  : 409 si el email ya existe (también cubre la condición de carrera con el índice único).
 */
export const registerUser = async ({ username, email, password }) => {
    if (await User.exists({ email })) {
        throw new AppError('El correo electrónico ya está en uso', 409)
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

    let user
    try {
        // isAdmin queda en false: los admins se crean con scripts/createAdmin.js
        user = await User.create({ username, email, password: hashedPassword })
    } catch (err) {
        // Dos registros simultáneos con el mismo email: el segundo choca con el índice único.
        if (err.code === 11000)
            throw new AppError('El correo electrónico ya está en uso', 409)
        throw err
    }

    return { user: toPublicUser(user), token: signAccessToken(user) }
}

/**
 * loginUser
 * Lo llama : authController.login
 * Recibe   : { email, password } validados por loginSchema.
 * Hace     : busca el usuario (pidiendo explícitamente el hash) → compara con bcrypt.
 * Devuelve : { user, token }
 * Errores  : 401 "Credenciales inválidas" — mismo mensaje y mismo tiempo exista o no el email.
 */
export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password') // +password: el campo está oculto por defecto

    const isPasswordValid = await bcrypt.compare(
        password,
        user?.password ?? DUMMY_HASH
    )
    if (!user || !isPasswordValid) {
        throw new AppError('Credenciales inválidas', 401)
    }

    return { user: toPublicUser(user), token: signAccessToken(user) }
}

/**
 * getProfile
 * Lo llama : authController.profile
 * Recibe   : userId (sale del JWT, vía req.user.id).
 * Devuelve : el usuario público actual desde la BD.
 * Errores  : 401 si el usuario ya no existe (token válido de una cuenta eliminada).
 */
export const getProfile = async (userId) => {
    const user = await User.findById(userId)
    if (!user) throw new AppError('Usuario no encontrado', 401)
    return toPublicUser(user)
}
