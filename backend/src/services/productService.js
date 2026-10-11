// E-commerce/backend/src/services/productService.js

/**
 * ARCHIVO     : src/services/productService.js
 * CAPA        : Servicios
 * ROL         : Operaciones del catálogo de productos (listar, consultar, crear, actualizar, eliminar).
 * LO CONSUME  : controllers/productController.js.
 * CONSUME     : models/ProductModel.js, AppError.
 * LO GENERA   : documentos de producto (los ve el frontend) o AppError 404 cuando no existe.
 *
 * Quién puede llamar a qué lo decide la RUTA (routes/productRoutes.js): leer es público;
 * crear, actualizar y eliminar exigen administrador.
 */
import Product from '../models/ProductModel.js'
import { AppError } from '../utils/AppError.js'

/**
 * listProducts
 * Lo llama : productController.listProducts   (GET /api/products?page=&limit=)
 * Recibe   : { page, limit } validados por productListQuerySchema.
 * Devuelve : { products, total } — productController pone "total" en la cabecera X-Total-Count.
 * lean()   : devuelve objetos JS planos (más rápido y ligero que documentos Mongoose completos).
 */
export const listProducts = async ({ page, limit }) => {
    const [products, total] = await Promise.all([
        Product.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product.countDocuments(),
    ])
    return { products, total }
}

/**
 * getProductById
 * Lo llama : productController.getProduct   (GET /api/products/:id)
 * Errores  : 404 si no existe.
 */
export const getProductById = async (id) => {
    const product = await Product.findById(id)
    if (!product) throw new AppError('Producto no encontrado', 404)
    return product
}

/**
 * createProduct
 * Lo llama : productController.createProduct   (POST /api/products — solo admin)
 * Recibe   : datos ya validados por productSchema.
 */
export const createProduct = async (data) => Product.create(data)

/**
 * updateProduct
 * Lo llama : productController.updateProduct   (PUT /api/products/:id — solo admin)
 * Recibe   : id y los campos a cambiar (validados por productUpdateSchema).
 * Hace     : actualiza y devuelve el documento NUEVO; runValidators aplica las reglas del modelo.
 * Errores  : 404 si no existe. (Corrige el bug anterior: se comprobaba "updateProduct" en vez de
 *            "updatedProduct", por lo que el 404 nunca se disparaba.)
 */
export const updateProduct = async (id, data) => {
    const product = await Product.findByIdAndUpdate(id, data, {
        returnDocument: 'after',
        runValidators: true,
    })
    if (!product) throw new AppError('Producto no encontrado', 404)
    return product
}

/**
 * deleteProduct
 * Lo llama : productController.deleteProduct   (DELETE /api/products/:id — solo admin)
 * Nota     : los carritos que aún contengan este producto se limpian solos la próxima vez que se
 *            consulten (cartService.buildCartView). Las órdenes pasadas conservan su "foto" del producto.
 */
export const deleteProduct = async (id) => {
    const product = await Product.findByIdAndDelete(id)
    if (!product) throw new AppError('Producto no encontrado', 404)
    return product
}
