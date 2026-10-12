import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import axios from 'axios'
import { http } from '../src/lib/http'
import App from '../src/App.jsx'

const id = (c) => c.repeat(24)
const PRODUCTS = [
  {
    _id: id('a'),
    name: 'Taza Deku',
    description: 'Taza edición especial',
    price: 7000,
    stock: 5,
    imageUrl: 'https://x.co/1.png',
  },
  {
    _id: id('b'),
    name: 'Taza Luffy',
    description: 'Taza de One Piece 2',
    price: 10000,
    stock: 0,
    imageUrl: 'https://x.co/2.png',
  },
]
const USER = {
  id: id('1'),
  username: 'rolo',
  email: 'rolo@gmail.com',
  isAdmin: false,
}
const ADMIN = { ...USER, isAdmin: true }

let calls
const ok = (data, headers = {}, status = 200) => ({ status, data, headers })
const fail = (status, data) => ({ status, data, headers: {} })

function mockApi(state) {
  calls = []
  http.defaults.adapter = async (config) => {
    const method = config.method.toLowerCase()
    const url = config.url
    const body = config.data ? JSON.parse(config.data) : undefined
    calls.push({ method, url, body })
    let r
    if (url === '/auth/profile')
      r = state.user ? ok(state.user) : fail(401, { error: 'No autenticado' })
    else if (url === '/products' && method === 'get')
      r = ok(PRODUCTS, { 'x-total-count': '2' })
    else if (url.startsWith('/products/') && method === 'get')
      r = ok(PRODUCTS.find((p) => url.endsWith(p._id)))
    else if (url === '/cart' && method === 'get')
      r = ok({ message: 'ok', cart: state.cart ?? { products: [] } })
    else if (url === '/cart' && method === 'delete')
      r = ok({ message: 'ok', cart: { products: [] } })
    else if (url === '/orders' && method === 'post')
      r = ok(
        { paymentUrl: 'https://mp.test/pay', preferenceId: 'p', orderId: 'o' },
        {},
        201,
      )
    else if (url.startsWith('/orders/')) r = ok({ order: state.order })
    else r = fail(404, { error: `sin mock: ${method} ${url}` })
    const response = { ...r, statusText: '', config }
    if (r.status >= 400)
      throw new axios.AxiosError(
        'err',
        'ERR_BAD_REQUEST',
        config,
        null,
        response,
      )
    return response
  }
}
const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('invitado', () => {
  it('Home lista productos y "Agregar" realmente agrega (antes el botón no hacía nada)', async () => {
    mockApi({ user: null })
    renderAt('/')
    expect(await screen.findByText('Taza Deku')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sin stock' }).disabled).toBe(
      true,
    ) // stock 0
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    await screen.findByRole('button', { name: /abrir carrito, 1 artículos/i })
    const saved = JSON.parse(localStorage.getItem('cart'))
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({
      _id: id('a'),
      name: 'Taza Deku',
      price: 7000,
      quantity: 1,
    })
  })

  it('no puede entrar a /checkout: redirige a /login', async () => {
    mockApi({ user: null })
    renderAt('/checkout')
    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeTruthy()
  })

  it('ruta desconocida muestra 404 (antes: página en blanco)', async () => {
    mockApi({ user: null })
    renderAt('/nada')
    expect(await screen.findByText('404')).toBeTruthy()
  })
})

describe('usuario autenticado', () => {
  const serverCart = { products: [{ productId: PRODUCTS[0], quantity: 3 }] }

  it('el carrito del servidor se mapea con nombre, precio e imagen (antes quedaba solo {quantity})', async () => {
    mockApi({ user: USER, cart: serverCart })
    renderAt('/')
    await screen.findByRole('button', { name: /abrir carrito, 3 artículos/i })
    await userEvent.click(
      screen.getByRole('button', { name: /abrir carrito/i }),
    )
    const dialog = await screen.findByRole('dialog', { hidden: true })
    expect(within(dialog).getByText('Taza Deku')).toBeTruthy()
    expect(dialog.textContent).toMatch(/7\.000/) // precio formateado
    expect(dialog.textContent).toMatch(/21\.000/) // 3 × 7.000
  })

  it('Checkout envía SOLO {id, quantity} + shippingInfo (sin precios) y valida campos', async () => {
    mockApi({ user: USER, cart: serverCart })
    renderAt('/checkout')
    await screen.findByRole('heading', { name: 'Checkout' })
    await userEvent.click(
      screen.getByRole('button', { name: /proceder al pago/i }),
    )
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(3) // errores accesibles
    const type = (label, v) => userEvent.type(screen.getByLabelText(label), v)
    await type('Nombre *', 'Juan')
    await type('Apellido *', 'Pérez')
    await type('Teléfono *', '3001234567')
    await type('Calle / dirección *', 'Calle 10')
    await type('Número *', '5-20')
    await type('Ciudad *', 'Cúcuta')
    await type('Departamento / provincia *', 'Norte de Santander')
    await type('Código postal *', '540001')
    await userEvent.click(
      screen.getByRole('button', { name: /proceder al pago/i }),
    )
    await waitFor(() =>
      expect(
        calls.some((c) => c.method === 'post' && c.url === '/orders'),
      ).toBe(true),
    )
    const { body } = calls.find((c) => c.url === '/orders')
    expect(body.items).toEqual([{ id: id('a'), quantity: 3 }])
    expect(JSON.stringify(body)).not.toMatch(/unit_price|currency|payer/)
    expect(body.shippingInfo.address.city).toBe('Cúcuta')
  })

  it('PaymentResult: orden approved → "Pago exitoso" y se vacía el carrito en el servidor', async () => {
    mockApi({
      user: USER,
      cart: serverCart,
      order: { _id: id('c'), status: 'approved' },
    })
    renderAt(`/payment/success?external_reference=${id('c')}&payment_id=99`)
    expect(
      await screen.findByRole('heading', { name: '¡Pago exitoso!' }),
    ).toBeTruthy()
    await waitFor(() =>
      expect(
        calls.some((c) => c.method === 'delete' && c.url === '/cart'),
      ).toBe(true),
    )
  })

  it('PaymentResult: visitar /payment/success con una orden NO pagada no muestra éxito ni vacía el carrito', async () => {
    mockApi({
      user: USER,
      cart: serverCart,
      order: { _id: id('c'), status: 'rejected' },
    })
    renderAt(`/payment/success?external_reference=${id('c')}&status=approved`) // URL forjada
    expect(
      await screen.findByRole('heading', { name: 'Pago rechazado' }),
    ).toBeTruthy()
    expect(calls.some((c) => c.method === 'delete' && c.url === '/cart')).toBe(
      false,
    )
  })

  it('un usuario normal no entra al panel admin', async () => {
    mockApi({ user: USER })
    renderAt('/admin/dashboard/products')
    expect(
      await screen.findByRole('heading', { name: /mi ecommerce/i }),
    ).toBeTruthy()
  })
})

describe('administrador', () => {
  it('tabla de productos con miniatura y botones de acción', async () => {
    mockApi({ user: ADMIN })
    renderAt('/admin/dashboard/products')
    expect(await screen.findByRole('table')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2)
  })

  it('el formulario de edición aparece PRECARGADO (antes quedaba vacío)', async () => {
    mockApi({ user: ADMIN })
    renderAt(`/admin/dashboard/products/updateProduct/${id('a')}`)
    const name = await screen.findByLabelText('Nombre')
    expect(name.value).toBe('Taza Deku')
    expect(screen.getByLabelText('Precio').value).toBe('7000')
  })
})
