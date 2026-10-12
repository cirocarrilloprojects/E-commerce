// E-commerce/frontend/src/pages/PaymentResult.jsx

/**
 * ARCHIVO : src/pages/PaymentResult.jsx
 * ROL     : pantalla a la que Mercado Pago devuelve al cliente: /payment/success | /payment/failure | /payment/pending.
 *           REEMPLAZA a PaymentSuccess, PaymentFailure y PaymentPending (tres archivos casi idénticos).
 * LO USA  : AppRoutes.jsx (una sola ruta /payment/:status, protegida).
 * USA     : hooks/useOrderStatus, CartContext.clearCart.
 *
 * CAMBIO IMPORTANTE DE SEGURIDAD/LÓGICA:
 *  Antes PaymentSuccess vaciaba el carrito y mostraba "¡Pago exitoso!" con SOLO visitar la URL (cualquiera puede escribir
 *  /payment/success?status=approved). Ahora el estado se lee del backend (GET /api/orders/:id, usando el parámetro
 *  external_reference que Mercado Pago añade a la URL) y el carrito se vacía únicamente cuando la orden figura "approved".
 *  El backend se entera del pago por el webhook, que puede tardar unos segundos → se consulta cada 3 s.
 */
import { useEffect } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
} from 'react-icons/fa'
import { Spinner } from '../components/ui/Spinner'
import { useCart } from '../context/CartContext'
import { useOrderStatus } from '../hooks/useOrderStatus'

// Contenido de cada pantalla. La clave se elige en deriveView() según lo que diga el backend.
const VIEWS = {
  success: {
    Icon: FaCheckCircle,
    color: 'text-success',
    title: '¡Pago exitoso!',
    text: 'Tu pago fue confirmado.',
  },
  failure: {
    Icon: FaTimesCircle,
    color: 'text-error',
    title: 'Pago rechazado',
    text: 'No se pudo procesar tu pago. Puedes intentarlo de nuevo con otro medio de pago.',
  },
  pending: {
    Icon: FaClock,
    color: 'text-warning',
    title: 'Pago pendiente',
    text: 'Tu pago está siendo verificado. Te avisaremos cuando se confirme; también puedes revisarlo en "Mis órdenes".',
  },
  review: {
    Icon: FaExclamationTriangle,
    color: 'text-warning',
    title: 'Pago recibido, requiere revisión',
    text: 'Recibimos tu pago pero hubo un problema con el inventario. Nuestro equipo se pondrá en contacto contigo.',
  },
}

// Valores válidos del segmento :status de la URL (los define el backend en back_urls).
const ROUTE_STATUSES = ['success', 'failure', 'pending']

/** StatusHeader — icono, título y texto de una vista (presentacional). */
const StatusHeader = ({ view }) => {
  const { Icon, color, title, text } = VIEWS[view]
  return (
    <div className="mb-6">
      <Icon className={`mx-auto mb-4 text-6xl ${color}`} aria-hidden="true" />
      <h1 className={`mb-2 text-3xl font-bold ${color}`}>{title}</h1>
      <p className="text-base-content/70">{text}</p>
    </div>
  )
}

/** deriveView — decide qué mostrar combinando la URL (pista) con el estado REAL de la orden (verdad). */
const deriveView = (routeStatus, order, timedOut) => {
  if (order?.status === 'approved') return 'success'
  if (order?.status === 'needs_review') return 'review'
  if (order?.status === 'rejected' || order?.status === 'cancelled')
    return 'failure'
  if (routeStatus === 'failure') return 'failure'
  if (timedOut || routeStatus === 'pending' || order?.status === 'in_process')
    return 'pending'
  return 'checking' // vino de "success" pero el webhook aún no confirmó
}

const PaymentResult = () => {
  const { status: routeStatus } = useParams()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()

  const orderId = searchParams.get('external_reference')
  const paymentId = searchParams.get('payment_id')

  const isKnownRoute = ROUTE_STATUSES.includes(routeStatus)
  const { order, error, timedOut } = useOrderStatus(orderId, {
    enabled: isKnownRoute && routeStatus !== 'failure',
  })
  const approved = order?.status === 'approved'

  // Se vacía el carrito SOLO cuando el backend confirma el pago. clearCart es idempotente.
  useEffect(() => {
    if (approved) clearCart({ silent: true })
  }, [approved, clearCart])

  if (!isKnownRoute) return <Navigate to="/" replace />

  const view = deriveView(routeStatus, order, timedOut)

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-base-100 p-8 text-center shadow-xl">
        {view === 'checking' ? (
          <div className="mb-6 flex flex-col items-center gap-3">
            <Spinner label="Confirmando tu pago…" />
            <p className="text-lg">Confirmando tu pago…</p>
          </div>
        ) : (
          <StatusHeader view={view} />
        )}

        {error && (
          <p role="alert" className="mb-4 text-sm text-error">
            No se pudo consultar la orden: {error.message}
          </p>
        )}

        {(orderId || paymentId) && (
          <dl className="mb-6 rounded-lg bg-base-200 p-4 text-left text-sm">
            {orderId && (
              <div>
                <dt className="inline font-medium">Orden: </dt>
                <dd className="inline">{orderId}</dd>
              </div>
            )}
            {paymentId && (
              <div>
                <dt className="inline font-medium">ID de pago: </dt>
                <dd className="inline">{paymentId}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn btn-primary flex-1">
            Volver al inicio
          </Link>
          {view === 'failure' ? (
            <Link to="/checkout" className="btn btn-outline flex-1">
              Intentar de nuevo
            </Link>
          ) : (
            <Link to="/orders" className="btn btn-outline flex-1">
              Ver mis órdenes
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
