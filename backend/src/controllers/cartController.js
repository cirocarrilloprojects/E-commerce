// E-commerce/backend/src/controllers/cartController.js

/**
 * ARCHIVO     : src/controllers/cartController.js
 * CAPA        : Controladores
 * ROL         : Traducir las peticiones del carrito en llamadas a cartService.
 * LO CONSUME  : routes/cartRoutes.js (todas las rutas exigen sesión: router.use(authenticate)).
 * CONSUME     : services/cartService.js.
 * LO GENERA   : respuestas { message, cart } que pinta el frontend.
 *
 * El dueño del carrito SIEMPRE es req.user.id (lo puso authenticate a partir del JWT).
 * Ya no existe userId en la URL ni en el cuerpo → no se puede acceder al carrito de otra persona.
 */
import * as cartService from '../services/cartService.js'

/** getCart — GET /api/cart → 200 { message, cart } (carrito vacío si aún no tiene). */
export const getCart = async (req, res) => {
    const cart = await cartService.getCart(req.user.id)
    res.status(200).json({ message: 'Carrito obtenido con éxito', cart })
}

/** addItem — POST /api/cart/items  body { productId, quantity? } → 200 { message, cart }. */
export const addItem = async (req, res) => {
    const cart = await cartService.addItem(req.user.id, req.validated.body)
    res.status(200).json({ message: 'Producto agregado al carrito', cart })
}

/** updateItem — PUT /api/cart/items/:productId  body { quantity } → 200 { message, cart }. */
export const updateItem = async (req, res) => {
    const cart = await cartService.updateItem(
        req.user.id,
        req.validated.params.productId,
        req.validated.body.quantity
    )
    res.status(200).json({ message: 'Carrito actualizado con éxito', cart })
}

/** removeItem — DELETE /api/cart/items/:productId → 200 { message, cart }. */
export const removeItem = async (req, res) => {
    const cart = await cartService.removeItem(
        req.user.id,
        req.validated.params.productId
    )
    res.status(200).json({
        message: 'Producto eliminado del carrito con éxito',
        cart,
    })
}

/** clearCart — DELETE /api/cart → 200 { message, cart } con el carrito vacío. */
export const clearCart = async (req, res) => {
    const cart = await cartService.clearCart(req.user.id)
    res.status(200).json({ message: 'Carrito vaciado con éxito', cart })
}

/** getCartTotal — GET /api/cart/total → 200 { message, total }. */
export const getCartTotal = async (req, res) => {
    const total = await cartService.getCartTotal(req.user.id)
    res.status(200).json({ message: 'Total obtenido con éxito', total })
}
