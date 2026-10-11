// E-commerce/backend/src/routes/productRoutes.js
import express from 'express'

const router = express.Router()

//rutas publias

router.get('/', (req, res) => {
    res.json({ message: 'OBTENER TODOS LOS PRODUCTOS' })
})

router.get('/:id', () => {})

// solo administradores

router.post('/', () => {}) // crear un producto

router.put('/id', () => {}) // actualizar un producto

router.delete('/id', () => {}) // eliminar un producto

export default router
