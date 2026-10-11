// E-commerce/backend/src/schema/authSchema.js

/**
 * ARCHIVO     : src/schema/authSchema.js
 * CAPA        : Validación
 * ROL         : Reglas de los datos de entrada de registro e inicio de sesión.
 * LO CONSUME  : routes/authRoutes.js (vía middleware validate), scripts/createAdmin.js, tests.
 * LO GENERA   : un objeto limpio en req.validated.body (email en minúsculas, sin campos extra).
 *
 * NOTAS:
 *  - password máx. 72: bcrypt solo usa los primeros 72 BYTES; más largo sería engañoso.
 *  - En el login NO se exige la política de contraseña (solo que exista): si algún día cambias la
 *    política, los usuarios antiguos aún deben poder entrar.
 */
import { z } from 'zod'

// Email normalizado: z.email() valida el formato y luego se pasa a minúsculas.
const emailSchema = z
    .email('El correo electrónico no es válido')
    .max(254, 'El correo electrónico no puede tener más de 254 caracteres')
    .transform((v) => v.toLowerCase())

export const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(20, 'El nombre de usuario no puede tener más de 20 caracteres'),
    email: emailSchema,
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(72, 'La contraseña no puede tener más de 72 caracteres'),
})

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'La contraseña es obligatoria').max(72),
})
