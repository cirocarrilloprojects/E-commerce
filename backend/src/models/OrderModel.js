// E-commerce/backend/src/models/OrderModel.js
/**
 * ARCHIVO     : src/models/OrderModel.js
 * CAPA        : Modelos
 * ROL         : Orden de compra (colección "orders") y su vínculo con el pago en Mercado Pago.
 * LO CONSUME  : orderService.js (crear/consultar órdenes), paymentService.js (actualizar estado tras el webhook).
 * LO GENERA   : orderService.createOrder la crea en estado "pending"; paymentService la cambia
 *               a approved / rejected / etc. cuando Mercado Pago notifica el resultado.
 *
 * CICLO DE VIDA DEL ESTADO (status):
 *   pending ──pago aprobado──────────► approved        (estado final)
 *   pending ──pago en proceso────────► in_process ──► approved | rejected
 *   pending ──pago rechazado/cancel.─► rejected | cancelled
 *   pending ──aprobado SIN stock─────► needs_review    (estado final: requiere reembolso manual)
 *
 * "products" guarda una FOTO (snapshot) de nombre y precio al momento de comprar:
 * si luego el producto cambia de precio, la orden histórica no se altera.
 */
import mongoose from 'mongoose'

export const ORDER_STATUSES = [
    'pending',
    'in_process',
    'approved',
    'rejected',
    'cancelled',
    'needs_review',
]

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }, // precio unitario al momento de la compra
        quantity: { type: Number, required: true, min: 1 },
        imageUrl: { type: String },
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        products: { type: [orderItemSchema], validate: (v) => v.length > 0 },
        totalAmount: { type: Number, required: true, min: 0 }, // calculado en el servidor, nunca recibido del cliente
        status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
        statusNote: { type: String }, // motivo legible cuando algo requiere atención (p. ej. sin stock)

        // Datos de Mercado Pago
        mercadoPagoData: {
            preferenceId: { type: String },
            payerEmail: { type: String },
            // unique + sparse: un mismo pago de MP no puede asociarse a dos órdenes (ayuda a la idempotencia).
            paymentId: { type: String, unique: true, sparse: true },
            paymentStatus: { type: String }, // estado "crudo" de MP (approved, pending, refunded...)
            transactionAmount: { type: Number },
            paymentMethodId: { type: String },
            paidAt: { type: Date },
        },

        // Datos de envío (validados por schema/orderSchema.js antes de llegar aquí)
        shippingInfo: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phone: { type: String, required: true },
            address: {
                street: { type: String, required: true },
                number: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                zipCode: { type: String, required: true },
            },
        },
    },
    { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
