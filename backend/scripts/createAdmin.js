// backend/scripts/createAdmin.js
/**
 * ARCHIVO     : scripts/createAdmin.js
 * CAPA        : Script de administración (se ejecuta a mano:  npm run seed:admin)
 * ROL         : Crear (o promover) el usuario administrador de la tienda.
 *               REEMPLAZA la regla anterior "el primer usuario que se registre es admin", que era
 *               peligrosa: en un despliegue nuevo, cualquiera podía quedarse con la tienda.
 * CONSUME     : variables ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD del .env,
 *               schema/authSchema.js (misma validación que el registro), UserModel, db.js.
 * LO GENERA   : un usuario con isAdmin = true en la colección "users".
 */
import bcrypt from 'bcryptjs'
import '../src/config/env.js' // carga y valida el .env (termina el proceso si es inválido)
import { connectDB, disconnectDB } from '../src/config/db.js'
import User from '../src/models/UserModel.js'
import { registerSchema } from '../src/schema/authSchema.js'

const run = async () => {
    // Reutiliza registerSchema: mismo formato de email, usuario y política de contraseña.
    const { email, username, password } = registerSchema.parse({
        email: process.env.ADMIN_EMAIL,
        username: process.env.ADMIN_USERNAME ?? 'admin',
        password: process.env.ADMIN_PASSWORD,
    })

    await connectDB()

    const existing = await User.findOne({ email })
    if (existing) {
        existing.isAdmin = true // el usuario ya existía: solo se le concede el rol
        await existing.save()
        console.log(`✅ ${email} ahora es administrador`)
    } else {
        await User.create({
            email,
            username,
            password: await bcrypt.hash(password, 12),
            isAdmin: true,
        })
        console.log(`✅ Administrador creado: ${email}`)
    }

    await disconnectDB()
}

run().catch(async (err) => {
    console.error(
        '❌',
        err.issues
            ? err.issues
                  .map((i) => `${i.path.join('.')}: ${i.message}`)
                  .join('\n')
            : err.message
    )
    await disconnectDB().catch(() => {})
    process.exit(1)
})
