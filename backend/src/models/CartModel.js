// E-commerce/backend/src/models/CartModel.js
/**
 * ARCHIVO     : src/models/CartModel.js
 * CAPA        : Modelos
 * ROL         : Carrito de compras: UN documento por usuario con la lista de (producto, cantidad).
 * LO CONSUME  : cartService.js (única clase de código que lo toca).
 * LO GENERA   : cartService.addItem lo crea la primera vez que el usuario agrega un producto.
 *
 * CAMBIOS vs. versión anterior:
 *  - userId es obligatorio y ÚNICO: antes podían existir varios carritos para el mismo usuario
 *    (o carritos "huérfanos" sin dueño). Los invitados ya no tienen carrito en servidor.
 *  - Solo se guarda el id del producto y la cantidad; precio y nombre se leen SIEMPRE del producto actual.
 */
import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: 'Cantidad entera',
            },
        },
    },
    { _id: false } // los ítems se identifican por productId, no necesitan _id propio
)

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // garantiza "un carrito por usuario" a nivel de base de datos
        },
        products: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
)

export default mongoose.model('Cart', cartSchema)
