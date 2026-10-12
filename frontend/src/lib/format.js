// E-commerce/frontend/src/lib/format.js
/**
 * ARCHIVO : src/lib/format.js
 * ROL     : formateo de precios y fechas para toda la interfaz (evita escribir `$${price}` en cada componente).
 * LO USA  : ProductCard, CartModal, Checkout, DetailProduct, ProductsTable, Orders, Navbar/CartButton.
 */
import { CURRENCY, LOCALE } from './config'

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

/** formatPrice(7000) → "$ 7.000" (según VITE_LOCALE / VITE_CURRENCY). */
export const formatPrice = (value) => priceFormatter.format(Number(value) || 0)

/** formatDate(iso) → fecha y hora legibles en el idioma configurado. */
export const formatDate = (iso) =>
  new Date(iso).toLocaleString(LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
