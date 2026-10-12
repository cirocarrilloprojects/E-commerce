// E-commerce/frontend/src/services/productServices.js

/**
 * ARCHIVO : src/services/productServices.js
 * CAPA    : servicios
 * ROL     : endpoints del catálogo (/api/products). Lectura pública; crear/editar/eliminar exigen admin.
 * LO USA  : hooks/useProducts.js (lectura) y las páginas pages/admin/* (escritura).
 */
import { http } from '../lib/http'

/**
 * GET /products?page=&limit=  → { products, total }
 * El backend devuelve un array y el total en la cabecera X-Total-Count.
 */
export const listProducts = async ({ page = 1, limit = 12, signal } = {}) => {
  const response = await http.get('/products', {
    params: { page, limit },
    signal,
  })
  return {
    products: response.data,
    total: Number(response.headers['x-total-count'] ?? response.data.length),
  }
}

export const getProduct = (id, signal) =>
  http.get(`/products/${id}`, { signal }).then((r) => r.data)
export const createProduct = (data) =>
  http.post('/products', data).then((r) => r.data)
export const updateProduct = (id, data) =>
  http.put(`/products/${id}`, data).then((r) => r.data)
export const deleteProduct = (id) =>
  http.delete(`/products/${id}`).then((r) => r.data)
