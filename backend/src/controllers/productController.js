// E-commerce/backend/src/controllers/productController.js
/**
 * ARCHIVO     : src/controllers/productController.js
 * CAPA        : Controladores
 * ROL         : Traducir las peticiones HTTP del catálogo en llamadas a productService.
 * LO CONSUME  : routes/productRoutes.js.
 * CONSUME     : services/productService.js.
 * LO GENERA   : respuestas JSON de productos (las muestra el frontend; las acciones de escritura las
 *               dispara un administrador).
 */
import * as productService from '../services/productService.js'

/**
 * listProducts — GET /api/products?page=1&limit=20   (público)
 * Salida : 200 con un ARRAY de productos (mismo formato que antes) y la cabecera X-Total-Count
 *          con el total, para que el frontend pueda paginar sin cambiar la forma de la respuesta.
 */
export const listProducts = async (req, res) => {
    const { products, total } = await productService.listProducts(
        req.validated.query
    )
    res.set('X-Total-Count', String(total))
    res.status(200).json(products)
}

/** getProduct — GET /api/products/:id   (público) → 200 con el producto, 404 si no existe. */
export const getProduct = async (req, res) => {
    const product = await productService.getProductById(req.validated.params.id)
    res.status(200).json(product)
}

/** createProduct — POST /api/products   (solo admin) → 201 { message, product }. */
export const createProduct = async (req, res) => {
    const product = await productService.createProduct(req.validated.body)
    res.status(201).json({ message: 'Producto creado exitosamente', product })
}

/** updateProduct — PUT /api/products/:id   (solo admin) → 200 { message, product }, 404 si no existe. */
export const updateProduct = async (req, res) => {
    const product = await productService.updateProduct(
        req.validated.params.id,
        req.validated.body
    )
    res.status(200).json({ message: 'Producto actualizado', product })
}

/** deleteProduct — DELETE /api/products/:id   (solo admin) → 200 { message, product }, 404 si no existe. */
export const deleteProduct = async (req, res) => {
    const product = await productService.deleteProduct(req.validated.params.id)
    res.status(200).json({
        message: 'Producto eliminado exitosamente',
        product,
    })
}
