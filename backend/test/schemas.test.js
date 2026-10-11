// backend/test/schemas.test.js

/**
 * ARCHIVO : test/schemas.test.js
 * ROL     : Pruebas de los esquemas Zod (las reglas de entrada de la API).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { registerSchema, loginSchema } from '../src/schema/authSchema.js'
import {
    productSchema,
    productUpdateSchema,
} from '../src/schema/productSchema.js'
import { createOrderSchema } from '../src/schema/orderSchema.js'

const shipping = {
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '3001234567',
    address: {
        street: 'Calle 1',
        number: '10',
        city: 'Cúcuta',
        state: 'NS',
        zipCode: '540001',
    },
}

test('registro: normaliza el email a minúsculas', () => {
    const r = registerSchema.parse({
        username: 'rolo',
        email: 'Rolo@Gmail.com',
        password: 'clave-segura-1',
    })
    assert.equal(r.email, 'rolo@gmail.com')
})

test('registro: rechaza contraseñas cortas y demasiado largas', () => {
    assert.equal(
        registerSchema.safeParse({
            username: 'rolo',
            email: 'a@b.co',
            password: '1234567',
        }).success,
        false
    )
    assert.equal(
        registerSchema.safeParse({
            username: 'rolo',
            email: 'a@b.co',
            password: 'x'.repeat(73),
        }).success,
        false
    )
})

test('login: no exige política de contraseña, solo que exista', () => {
    assert.equal(
        loginSchema.safeParse({ email: 'a@b.co', password: 'abc' }).success,
        true
    )
    assert.equal(
        loginSchema.safeParse({ email: 'a@b.co', password: '' }).success,
        false
    )
})

test('producto: rechaza precio 0 e imagen con esquema no http(s)', () => {
    const base = {
        name: 'Taza',
        description: 'Taza edición especial',
        price: 7000,
        stock: 5,
        imageUrl: 'https://x.co/a.png',
    }
    assert.equal(productSchema.safeParse(base).success, true)
    assert.equal(productSchema.safeParse({ ...base, price: 0 }).success, false)
    assert.equal(
        productSchema.safeParse({ ...base, imageUrl: 'javascript:alert(1)' })
            .success,
        false
    )
})

test('producto: la actualización exige al menos un campo', () => {
    assert.equal(productUpdateSchema.safeParse({}).success, false)
    assert.equal(productUpdateSchema.safeParse({ stock: 3 }).success, true)
})

test('orden: ignora precios enviados por el cliente y rechaza listas vacías', () => {
    const ok = createOrderSchema.parse({
        items: [{ id: 'a'.repeat(24), quantity: 2, unit_price: 1 }], // unit_price debe descartarse
        shippingInfo: shipping,
    })
    assert.equal('unit_price' in ok.items[0], false)
    assert.equal(
        createOrderSchema.safeParse({ items: [], shippingInfo: shipping })
            .success,
        false
    )
})
