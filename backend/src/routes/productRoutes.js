// E-commerce/backend/src/routes/productRoutes.js
import express from 'express'
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
} from '../controllers/productsControllers.js'
const router = express.Router()

//rutas publias

router.get('/', getAllProducts)

router.get('/:id', getProductById)

// solo administradores

router.post('/', createProduct) // crear un producto

router.put('/:id', updateProduct) // actualizar un producto

router.delete('/:id', deleteProduct) // eliminar un producto

export default router
