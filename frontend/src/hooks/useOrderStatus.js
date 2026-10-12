// E-commerce/frontend/src/hooks/useOrderStatus.js
/**
 * ARCHIVO : src/hooks/useOrderStatus.js
 * CAPA    : custom hook (consulta periódica con limpieza)
 * ROL     : consultar el estado REAL de una orden hasta que llegue a un estado final.
 * LO USA  : pages/PaymentResult.jsx.
 *
 * POR QUÉ: al volver de Mercado Pago, la URL (?status=approved…) la puede escribir cualquiera: NO prueba que se pagó.
 * La confirmación real es el webhook del backend, que puede tardar unos segundos. Por eso se consulta
 * GET /api/orders/:id cada 3 s (máx. 10 intentos) hasta ver approved / rejected / cancelled / needs_review.
 * Limpieza: al desmontar se cancela la petición en curso y el temporizador (sin fugas).
 */
import { useEffect, useState } from 'react'
import { getOrder } from '../services/orderServices'
import { isCanceled } from '../lib/http'

const FINAL_STATUSES = new Set([
  'approved',
  'rejected',
  'cancelled',
  'needs_review',
])

export const useOrderStatus = (
  orderId,
  { enabled = true, intervalMs = 3000, maxAttempts = 10 } = {},
) => {
  const [state, setState] = useState({
    order: null,
    error: null,
    timedOut: false,
  })

  useEffect(() => {
    if (!enabled || !orderId) return

    const controller = new AbortController()
    let timer
    let attempts = 0

    const poll = async () => {
      try {
        const { order } = await getOrder(orderId, controller.signal)
        setState({ order, error: null, timedOut: false })
        if (FINAL_STATUSES.has(order.status)) return // estado final: dejar de consultar
      } catch (error) {
        if (isCanceled(error)) return
        setState((s) => ({ ...s, error }))
        return // error real (404, 401…): reintentar no ayuda
      }

      attempts += 1
      if (attempts >= maxAttempts) setState((s) => ({ ...s, timedOut: true }))
      else timer = setTimeout(poll, intervalMs)
    }

    poll()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [orderId, enabled, intervalMs, maxAttempts])

  return state
}
