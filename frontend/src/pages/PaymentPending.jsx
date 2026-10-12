// E-commerce/frontend/src/pages/PaymentPending.jsx
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FaClock } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const PaymentPending = () => {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const merchantOrder = searchParams.get('merchant_order_id')

  useEffect(() => {
    // Mostrar notificación de pendiente
    toast('Pago en proceso de verificación', {
      icon: '⏳',
      duration: 4000,
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <FaClock className="text-6xl text-warning mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-warning mb-2">
            Pago Pendiente
          </h1>
          <p className="text-lg text-base-content/70">
            Tu pago está siendo procesado
          </p>
        </div>

        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">¿Qué significa esto?</h3>
          <div className="text-sm text-left space-y-2">
            <p>
              Tu pago está siendo verificado por Mercado Pago. Esto puede
              suceder cuando:
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Pagaste en efectivo (Rapipago, Pago Fácil, etc.)</li>
              <li>• Usaste transferencia bancaria</li>
              <li>• El banco está verificando la transacción</li>
            </ul>
          </div>
        </div>

        {(paymentId || status || merchantOrder) && (
          <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Detalles del Pago:</h3>
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
          <div className="alert alert-info">
            <div className="text-sm">
              <p className="font-medium">Te notificaremos por email</p>
              <p>
                Una vez que se confirme el pago, recibirás un email de
                confirmación.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="btn btn-primary flex-1">
              Volver al Inicio
            </Link>
            <Link to="/orders" className="btn btn-outline flex-1">
              Ver mis Órdenes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPending
