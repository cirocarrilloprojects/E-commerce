// E-commerce/backend/src/models/UserModel.js

import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        trim: true,
        minlength: [
            6,
            'El correo electrónico debe tener al menos 6 caracteres',
        ],
        maxlength: [
            254,
            'El correo electrónico no puede tener más de 254 caracteres',
        ],
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        maxlength: [254, 'La contraseña no puede tener más de 254 caracteres'],
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
        maxlength: [
            20,
            'El nombre de usuario no puede tener más de 20 caracteres',
        ],
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: [true, 'El campo isAdmin es obligatorio'],
    },
})

export default mongoose.model('User', userSchema)
