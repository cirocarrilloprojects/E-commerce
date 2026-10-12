// E-commerce/frontend/src/lib/config.js
/**
 * ARCHIVO : src/lib/config.js
 * ROL     : constantes de configuración del frontend leídas de variables VITE_* (única fuente de verdad).
 * LO USA  : lib/format.js (moneda), pages/Home y pages/admin/AdminProducts (tamaño de página).
 */
export const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'COP'
export const LOCALE = import.meta.env.VITE_LOCALE ?? 'es-CO'
export const PAGE_SIZE = 12
