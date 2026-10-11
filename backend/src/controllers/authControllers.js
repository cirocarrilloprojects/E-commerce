// E-commerce/backend/src/controllers/authControllers.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/UserModel.js'
import { registerSchema, loginSchema } from '../schema/authSchema.js'

export const registerUser = async (req, res) => {
    try {
        // 1. Validar datos con Zod
        const { email, password, username } = registerSchema.parse(req.body)

        // 2. Verificar duplicado
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res
                .status(409)
                .json({ error: 'El correo electrónico ya está en uso' })
        }

        // 3. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10)

        // 4. ¿Es el primer usuario? → admin
        const isFirstUser = (await User.countDocuments()) === 0

        // 5. Crear usuario
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            isAdmin: isFirstUser,
        })

        // 6. Firmar JWT
        const token = jwt.sign(
            { id: newUser._id, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        // 6.1. Guardar token en la cookie
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cambiar a 'strict' para mayor seguridad
            maxAge: 3600000, // 1 hora
        })
        // 7. Responder
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
            },
            token,
        })
    } catch (error) {
        console.error('❌ Error en registerUser:', error)

        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.issues,
            })
        }

        if (error.code === 11000) {
            return res.status(409).json({
                error: 'El correo electrónico ya está en uso',
            })
        }

        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const loginUser = async (req, res) => {
    try {
        // obtener la clave secreta del entorno
        const JWT_SECRET = process.env.JWT_SECRET
        // extraer el email y contraseña del cuerpo de la peticion
        // ademas validarlo
        const { email, password } = loginSchema.parse(req.body)

        // res.json({ email: email, password: password })

        // buscar el usuario por email
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' })
        }
        //  Comparar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password) // ← ESTA LÍNEA FALTA

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' })
        }

        // Generar un token con JWT
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        }

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        })
            .status(200)
            .json(userData)
    } catch (error) {
        console.error('❌ Error en loginUser:', error)
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Datos inválidos',
                details: error.issues,
            })
        }

        res.status(500).json({
            message: 'Error al iniciar sesion',
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
            }),
        })
    }
}
// --- perfile
export const profile = async (req, res) => {
    try {
        const token = req.cookies.accessToken
        if (!token) {
            return res.status(401).json({ error: 'No autenticado' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        })
    } catch (error) {
        console.error('❌ Error en profile:', error.message)
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({ error: 'Token inválido o expirado' })
        }
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const logout = (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
    res.status(200).json({ message: 'Sesión cerrada' })
}
