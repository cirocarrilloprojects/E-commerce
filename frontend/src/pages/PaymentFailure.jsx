// E-commerce/frontend/src/pages/PaymentFailure.jsx
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FaTimesCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const PaymentFailure = () => {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const merchantOrder = searchParams.get('merchant_order_id')

  useEffect(() => {
    // Mostrar notificación de error
    toast.error('El pago no pudo ser procesado')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <FaTimesCircle className="text-6xl text-error mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-error mb-2">Pago Rechazado</h1>
          <p className="text-lg text-base-content/70">
            No se pudo procesar tu pago
          </p>
        </div>

        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Posibles causas:</h3>
          <ul className="text-sm text-left space-y-1">
            <li>• Fondos insuficientes</li>
            <li>• Datos de tarjeta incorrectos</li>
            <li>• Tarjeta vencida o bloqueada</li>
            <li>• Límite de compra excedido</li>
          </ul>
        </div>

        {(paymentId || status || merchantOrder) && (
          <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Detalles del Intento:</h3>
            <div className="space-y-1 text-sm">
              {paymentId && (
                <p>
                  <span className="font-medium">ID de Pago:</span> {paymentId}
                </p>
              )}
              {status && (
                <p>
                  <span className="font-medium">Estado:</span> {status}
                </p>
              )}
              {merchantOrder && (
                <p>
                  <span className="font-medium">Orden:</span> {merchantOrder}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-base-content/60">
            Puedes intentar nuevamente con otro método de pago o contactar a tu
            banco.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/checkout" className="btn btn-primary flex-1">
              Intentar Nuevamente
            </Link>
            <Link to="/" className="btn btn-outline flex-1">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailure
