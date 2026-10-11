// E-commerce/backend/src/controllers/productsControllers.js
import Product from '../models/productModel.js'
import { productSchema } from '../schema/productSchema.js'
import { ZodError } from 'zod'

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl } =
            productSchema.parse(req.body)
        const product = await Product.create({
            name,
            description,
            price,
            stock,
            imageUrl,
        })

        return res
            .status(201)
            .json({ message: 'producto creado exitosamente', product })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }
        return res.status(500).json({ message: 'Error al crear el producto' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        // 1. validar los datos de entrada zod
        const validateData = productSchema.partial().parse(req.body) //permitiar algunos campos no los agreguen
        // 2. buscar y actualizar el producto
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            validateData,
            { returnDocument: 'after', runValidators: true }
        )
        // 3. manejar el caso de que el producto no exista
        if (!updateProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        // 4. devolver el producto actualizado
        return res.status(200).json({
            message: 'Producto actualizado',
            product: updatedProduct,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Datos inválidos',
                details: error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })),
            })
        }

        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID inválido' })
        }

        res.status(500).json({ message: 'Error al actualizar producto' })
    }
}
// buscar producto
export const getProductById = async (req, res) => {
    try {
        const productID = await Product.findById(req.params.id)
        if (!productID) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }
        return res.status(200).json(productID)
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID inválido' })
        }
        return res.status(500).json({ message: 'Error al obtener el producto' })
    }
}
// mostrar todos los productos
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        return res.status(200).json(products)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener los productos' })
    }
}

// Eliminar un producto
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id)

        // 1. No existe
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        // 2. Éxito
        return res.status(200).json({
            message: 'Producto eliminado exitosamente',
            product: deletedProduct,
        })
    } catch (error) {
        console.error('Error en deleteProduct:', error)

        // 3. ID inválido
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID inválido' })
        }

        // 4. Error interno
        return res
            .status(500)
            .json({ message: 'Error al eliminar el producto' })
    }
}
