// E-commerce/backend/src/models/UserModel.js
/**
 * ARCHIVO     : src/models/UserModel.js
 * CAPA        : Modelos (acceso a datos / forma de los documentos en MongoDB)
 * ROL         : Define cómo se guarda un usuario en la colección "users".
 * LO CONSUME  : authService.js (crear usuario, login, perfil), orderService.js (leer el email),
 *               scripts/createAdmin.js (crear/promover administrador).
 * LO GENERA   : Mongoose crea la colección y los índices la primera vez que se usa el modelo.
 *
 * DECISIONES DE SEGURIDAD:
 *  - password usa  select:false  → NINGUNA consulta devuelve el hash salvo que se pida con .select('+password')
 *    (solo loginService lo pide). Así es imposible filtrar el hash por accidente en una respuesta.
 *  - email se guarda en minúsculas → "Rolo@x.com" y "rolo@x.com" ya no son usuarios distintos.
 *  - La validación de la contraseña en texto plano (longitud, etc.) se hace en schema/authSchema.js;
 *    aquí solo se almacena el hash de bcrypt (60 caracteres), por eso no hay minlength/maxlength.
 */
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'El correo electrónico es obligatorio'],
            unique: true, // crea un índice único: la BD misma impide duplicados (incluso con peticiones simultáneas)
            trim: true,
            lowercase: true,
            maxlength: [
                254,
                'El correo electrónico no puede tener más de 254 caracteres',
            ],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            select: false, // no se incluye en consultas por defecto
        },
        username: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio'],
            trim: true,
            minlength: [
                3,
                'El nombre de usuario debe tener al menos 3 caracteres',
            ],
            maxlength: [
                20,
                'El nombre de usuario no puede tener más de 20 caracteres',
            ],
        },
        isAdmin: {
            type: Boolean,
            default: false, // los administradores se crean con "npm run seed:admin", nunca por registro público
        },
    },
    { timestamps: true }
)

export default mongoose.model('User', userSchema)
