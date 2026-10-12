// E-commerce/frontend/src/lib/http.js
/**
 * ARCHIVO : src/lib/http.js
 * CAPA    : acceso a la red (único lugar que configura axios)
 * ROL     : instancia de axios compartida + normalización de errores.
 * LO USA  : TODOS los archivos de src/services/*.
 * LO GENERA: ApiError — un error con { message, status, details } listo para mostrar en la interfaz.
 *
 * ANTES: cada servicio hacía  axios.defaults.withCredentials = true  (modificaba el axios GLOBAL) y capturaba el
 * error lanzando new Error('texto genérico'), perdiendo el código HTTP y el mensaje real del backend
 * (por ejemplo "Solo hay 3 unidades disponibles"). Ahora el interceptor conserva todo.
 * El backend v2 siempre responde errores como { error: "mensaje", details?: [{field, message}] }.
 */
import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? '/api',
  withCredentials: true, // envía la cookie httpOnly de sesión
  timeout: 15000,
})

/** ApiError — error de la API con el estado HTTP y los detalles de validación. */
export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/** isCanceled — true si la petición fue abortada con AbortController (no es un error real; se ignora). */
export const isCanceled = (error) => axios.isCancel(error)

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status
    const data = error.response?.data
    // Si el backend envió detalles de validación (Zod), se muestran juntos: "El nombre debe tener… · El precio…"
    const detailsText = Array.isArray(data?.details)
      ? data.details.map((d) => d.message).join(' · ')
      : ''
    const message =
      detailsText ||
      data?.error ||
      (status ? `Error ${status}` : 'No se pudo conectar con el servidor')

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
