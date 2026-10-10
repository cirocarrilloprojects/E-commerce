// E-commerce/backend/src/routes/authRoutes.js

import express from 'express'
import { registerUser, profile } from '../controllers/authControllers.js'
const router = express.Router()

router.post('/register', registerUser)

router.post('/login', (req, res) => {
    console.log('Hiciste una peticion POST a /login')
    res.json({ message: 'Hiciste una peticion POST a /login' })
})

router.post('/logout', (req, res) => {
    console.log('Hiciste una peticion POST a /logout')
    res.json({ message: 'Hiciste una peticion POST a /logout' })
})

router.get('/profile', profile)

export default router
