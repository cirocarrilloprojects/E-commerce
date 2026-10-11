// E-commerce/backend/src/models/ProductModel.js
/**
 * ARCHIVO     : src/models/ProductModel.js
 * CAPA        : Modelos
 * ROL         : Define el producto del catálogo (colección "products").
 * LO CONSUME  : productService.js (CRUD), cartService.js (validar existencia/stock y mostrar datos),
 *               orderService.js (precio y stock al crear la orden), paymentService.js (descontar stock).
 * LO GENERA   : documentos creados por productService.createProduct (acción de un administrador).
 *
 * NOTA: el PRECIO REAL siempre sale de aquí. El cliente nunca decide cuánto cuesta algo.
 */
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stock: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: 'El stock debe ser un entero',
            },
        },
        imageUrl: { type: String, required: true },
    },
    { timestamps: true }
)

// Índice para que el listado "más recientes primero" (productService.listProducts) sea rápido.
productSchema.index({ createdAt: -1 })

export default mongoose.model('Product', productSchema)
