// E-commerce/frontend/src/hooks/useProducts.js
/**
 * ARCHIVO : src/hooks/useProducts.js
 * ROL     : hooks de lectura del catálogo. Reemplazan al antiguo ProductContext (estado de SERVIDOR en un Context global).
 * LO USA  : pages/Home, pages/DetailProduct, pages/admin/AdminProducts, pages/admin/UpdateProduct.
 * USA     : hooks/useFetch + services/productServices.
 *
 * Por qué fuera del Context: un Context global con un único slot "product" mezclaba pantallas y refrescaba a
 * todos los consumidores. Con hooks, cada pantalla pide lo suyo y se limpia sola al desmontarse.
 * (Siguiente paso recomendado a futuro: TanStack Query, que añade caché y reintentos sobre esta misma idea.)
 */
import { useFetch } from './useFetch'
import { getProduct, listProducts } from '../services/productServices'

/** useProducts({ page, limit }) → { data: { products, total } | null, loading, error, refetch } */
export const useProducts = ({ page = 1, limit = 12 } = {}) =>
  useFetch((signal) => listProducts({ page, limit, signal }), [page, limit])

/** useProduct(id) → { data: producto | null, loading, error, refetch } */
export const useProduct = (id) =>
  useFetch((signal) => getProduct(id, signal), [id])
