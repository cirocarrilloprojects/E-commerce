// E-commerce/frontend/src/lib/http.js
/**
 * ARCHIVO : src/lib/http.js
 * CAPA    : acceso a la red (único lugar que configura axios)
 * ROL     : instancia de axios compartida + normalización de errores.
 * LO USA  : TODOS los archivos de src/services/*.
 * LO GENERA: ApiError — un error con { message, status, details, isNetworkError } listo para la UI.
 *
 * NUEVO (notificaciones de caídas):
 *  - Detecta errores de RED (backend apagado, timeout, ECONNRESET) y los marca con isNetworkError=true.
 *  - Muestra UN toast de error por ventana de tiempo (NETWORK_TOAST_COOLDOWN_MS) para no spamear cuando
 *    la app dispara 5 peticiones al mismo tiempo contra un backend caído.
 *  - Los errores 502/503/504 también se consideran "backend caído" porque suelen venir de un proxy que
 *    no puede alcanzar al proceso (típico cuando el backend se reinicia).
 */
import axios from 'axios'
import toast from 'react-hot-toast'

export const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? '/api',
  withCredentials: true,
  timeout: 15000,
})

/** ApiError — error de la API con el estado HTTP, los detalles de validación y si fue un fallo de red. */
export class ApiError extends Error {
  constructor(message, { status, details, isNetworkError = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.isNetworkError = isNetworkError
  }
}

/** isCanceled — true si la petición fue abortada con AbortController (no es un error real; se ignora). */
export const isCanceled = (error) => axios.isCancel(error)

/**
 * Control de spam de toasts de red.
 * Si la app dispara 10 peticiones y el backend está caído, queremos ver UN solo aviso, no diez.
 */
let lastNetworkToastAt = 0
const NETWORK_TOAST_COOLDOWN_MS = 5000

/** networkToastOnce — muestra el toast de "backend caído" solo si pasó el cooldown. */
const networkToastOnce = (message) => {
  const now = Date.now()
  if (now - lastNetworkToastAt < NETWORK_TOAST_COOLDOWN_MS) return
  lastNetworkToastAt = now
  toast.error(message, { id: 'network-error', duration: 5000 })
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status
    const data = error.response?.data

    // Sin response = nunca llegó al servidor (backend apagado, DNS, timeout, ECONNRESET…).
    // 502/503/504 = hay algo escuchando (proxy) pero no puede alcanzar al backend.
    const isNetworkError = !error.response || [502, 503, 504].includes(status)

    if (isNetworkError) {
      networkToastOnce(
        'No se pudo conectar con el servidor. Verifica que el backend esté encendido.',
      )
      return Promise.reject(
        new ApiError('No se pudo conectar con el servidor', {
          status,
          isNetworkError: true,
        }),
      )
    }

    const detailsText = Array.isArray(data?.details)
      ? data.details.map((d) => d.message).join(' · ')
      : ''
    const message =
      detailsText ||
      data?.error ||
      (status ? `Error ${status}` : 'Error inesperado')

    return Promise.reject(
      new ApiError(message, { status, details: data?.details }),
    )
  },
)

/** getErrorMessage — texto seguro para mostrar al usuario (usa el del backend si existe). */
export const getErrorMessage = (
  error,
  fallback = 'Ocurrió un error inesperado',
) => (error instanceof ApiError ? error.message : fallback)
