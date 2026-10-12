// E-commerce/frontend/src/pages/PaymentSuccess.jsx
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FaCheckCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useCart } from '../Context/CartContext'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const merchantOrder = searchParams.get('merchant_order_id')

  useEffect(() => {
    // Limpiar carrito ya que el pago fue exitoso
    clearCart()

    // Limpiar respaldo del sessionStorage
    sessionStorage.removeItem('checkoutCart')

    // Mostrar notificación de éxito
    toast.success('¡Pago realizado exitosamente!')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <FaCheckCircle className="text-6xl text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-success mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg text-base-content/70">
            Tu pago ha sido procesado correctamente
          </p>
        </div>

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

        <div className="space-y-3">
          <p className="text-sm text-base-content/60">
            Recibirás un email de confirmación con los detalles de tu compra.
          </p>

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

export default PaymentSuccess
