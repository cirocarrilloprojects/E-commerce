// E-commerce/backend/src/schema/authSchema.js

import { z } from 'zod'

export const registerSchema = z.object({
    email: z
        .string()
        .email({ message: 'El correo electrónico no es válido' })
        .min(6, {
            message: 'El correo electrónico debe tener al menos 6 caracteres',
        })
        .max(254, {
            message:
                'El correo electrónico no puede tener más de 254 caracteres',
        }),
    password: z
        .string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
        .max(254, {
            message: 'La contraseña no puede tener más de 254 caracteres',
        }),
    username: z
        .string()
        .min(3, {
            message: 'El nombre de usuario debe tener al menos 3 caracteres',
        })
        .max(20, {
            message: 'El nombre de usuario no puede tener más de 20 caracteres',
        }),
})
