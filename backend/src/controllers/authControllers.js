// E-commerce/backend/src/controllers/authControllers.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/UserModel.js'
import { registerSchema } from '../schema/authSchema.js'

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

export const profile = async (req, res) => {
    // extraer el accesstoken enviado por el cliente en la cookie
    console.log('req.cookies', req.cookies)
    const token = req.cookies.accessToken
    console.log('token', token)

    return {
        user: 'test user',
    }
}
