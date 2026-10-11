// E-commerce/backend/src/services/cartService.js

/**
 * ARCHIVO     : src/services/cartService.js
 * CAPA        : Servicios
 * ROL         : Toda la lógica del carrito de compras de UN usuario autenticado.
 * LO CONSUME  : controllers/cartController.js (cada función de abajo la llama una acción del controlador).
 * CONSUME     : models/CartModel.js (carrito), models/ProductModel.js (existencia, precio y stock), AppError.
 * LO GENERA   : la "vista del carrito" (cartView): carrito con cada ítem enlazado a su producto vigente.
 *
 * REGLA DE ORO: el userId SIEMPRE viene del token (req.user.id) → un usuario solo puede tocar su carrito.
 *
 * FORMA DE LA VISTA (cartView) — la misma que devolvía antes populate():
 *   { _id, userId, products: [{ productId: { _id, name, price, stock, imageUrl }, quantity }], updatedAt }
 */
import Cart from '../models/CartModel.js'
import Product from '../models/ProductModel.js'
import { AppError } from '../utils/AppError.js'

/**
 * buildCartView
 * Qué hace : convierte un documento Cart en la vista que ve el frontend, uniendo cada ítem con los datos
 *            ACTUALES del producto. Si algún producto fue eliminado del catálogo, lo quita del carrito.
 * Lo llama : getCart, addItem, updateItem, removeItem, clearCart y getCartTotal (todas devuelven su resultado).
 * Por qué no populate(): populate deja null los productos borrados y perdemos su id; aquí los detectamos
 *            y los eliminamos (también evita el error anterior de getCartTotal con item.productId = null).
 */
const buildCartView = async (cart) => {
    const ids = cart.products.map((item) => item.productId)
    const products = await Product.find({ _id: { $in: ids } })
        .select('name price stock imageUrl')
        .lean()
    const byId = new Map(products.map((p) => [String(p._id), p]))

    // Ítems cuyo producto todavía existe
    const alive = cart.products.filter((item) =>
        byId.has(String(item.productId))
    )
    if (alive.length !== cart.products.length) {
        cart.products = alive // limpieza de productos eliminados
        await cart.save()
    }

    return {
        _id: cart._id,
        userId: cart.userId,
        products: alive.map((item) => ({
            productId: byId.get(String(item.productId)),
            quantity: item.quantity,
        })),
        updatedAt: cart.updatedAt,
    }
}

/**
 * calculateTotal
 * Qué hace : suma precio × cantidad de todos los ítems de una cartView (precios reales de la BD).
 * Lo llama : getCartTotal.
 */
const calculateTotal = (cartView) =>
    cartView.products.reduce(
        (acc, item) => acc + item.productId.price * item.quantity,
        0
    )

/**
 * getCart
 * Lo llama : cartController.getCart   (GET /api/cart)
 * Devuelve : cartView; si el usuario aún no tiene carrito, un carrito vacío (sin crearlo en la BD).
 */
export const getCart = async (userId) => {
    const cart = await Cart.findOne({ userId })
    if (!cart) return { userId, products: [] }
    return buildCartView(cart)
}

/**
 * addItem
 * Lo llama : cartController.addItem   (POST /api/cart/items)
 * Recibe   : userId (token), productId y quantity (validados por addItemSchema).
 * Hace     : verifica que el producto exista → calcula la cantidad TOTAL resultante (lo que ya había + lo nuevo)
 *            → verifica el stock sobre ese total → crea el carrito si no existe → guarda.
 * Errores  : 404 producto inexistente · 409 la cantidad total supera el stock.
 * Mejora   : antes el stock solo se validaba si ya existía el carrito y sin sumar lo ya agregado.
 */
export const addItem = async (userId, { productId, quantity }) => {
    const product = await Product.findById(productId)
    if (!product) throw new AppError('Producto no encontrado', 404)

    const cart =
        (await Cart.findOne({ userId })) ?? new Cart({ userId, products: [] })

    const existing = cart.products.find(
        (item) => String(item.productId) === productId
    )
    const newQuantity = (existing?.quantity ?? 0) + quantity

    if (newQuantity > product.stock) {
        throw new AppError(
            `Solo hay ${product.stock} unidades disponibles`,
            409
        )
    }

    if (existing) existing.quantity = newQuantity
    else cart.products.push({ productId, quantity })

    await cart.save()
    return buildCartView(cart)
}

/**
 * updateItem
 * Lo llama : cartController.updateItem   (PUT /api/cart/items/:productId)
 * Recibe   : userId (token), productId (URL) y quantity nueva (cuerpo, 1–99).
 * Hace     : REEMPLAZA la cantidad (no suma) respetando el stock.
 * Errores  : 404 carrito/ítem/producto inexistente · 409 cantidad mayor que el stock.
 */
export const updateItem = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ userId })
    const item = cart?.products.find((i) => String(i.productId) === productId)
    if (!cart || !item)
        throw new AppError('Producto no encontrado en el carrito', 404)

    const product = await Product.findById(productId)
    if (!product) throw new AppError('Producto no encontrado', 404)

    if (quantity > product.stock) {
        throw new AppError(
            `Solo hay ${product.stock} unidades disponibles`,
            409
        )
    }

    item.quantity = quantity
    await cart.save()
    return buildCartView(cart)
}

/**
 * removeItem
 * Lo llama : cartController.removeItem   (DELETE /api/cart/items/:productId)
 * Errores  : 404 si el carrito o el producto dentro del carrito no existen.
 */
export const removeItem = async (userId, productId) => {
    const cart = await Cart.findOne({ userId })
    const index = cart
        ? cart.products.findIndex((i) => String(i.productId) === productId)
        : -1
    if (index === -1)
        throw new AppError('Producto no encontrado en el carrito', 404)

    cart.products.splice(index, 1)
    await cart.save()
    return buildCartView(cart)
}

/**
 * clearCart
 * Lo llama : cartController.clearCart   (DELETE /api/cart)
 * Es idempotente: vaciar un carrito inexistente o ya vacío no es error.
 */
export const clearCart = async (userId) => {
    const cart = await Cart.findOne({ userId })
    if (!cart) return { userId, products: [] }

    cart.products = []
    await cart.save()
    return buildCartView(cart)
}

/**
 * getCartTotal
 * Lo llama : cartController.getCartTotal   (GET /api/cart/total)
 * Devuelve : número (suma de precio × cantidad con precios actuales). 0 si no hay carrito.
 * Ojo      : es solo informativo para la pantalla. El total que se COBRA lo recalcula orderService.createOrder.
 */
export const getCartTotal = async (userId) => {
    const view = await getCart(userId)
    return calculateTotal(view)
}
