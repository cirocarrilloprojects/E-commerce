// E-commerce/frontend/src/pages/Checkout.jsx
/**
 * ARCHIVO : src/pages/Checkout.jsx
 * ROL     : captura los datos de envío, crea la orden en el backend y redirige a Mercado Pago.
 * LO USA  : AppRoutes.jsx (/checkout, ruta protegida: hace falta sesión).
 * USA     : CartContext, services/orderServices.createOrder, TextField, lib/validation, lib/format.
 *
 * FLUJO: formulario → POST /api/orders con { items:[{id, quantity}], shippingInfo } → el backend responde
 *        { paymentUrl } → window.location.assign(paymentUrl) → el cliente paga en Mercado Pago →
 *        Mercado Pago vuelve a /payment/success|failure|pending.
 *
 * CAMBIOS vs. versión anterior:
 *  - YA NO se envían unit_price, title, currency ('ARS' escrito a mano) ni payer: el servidor toma precios, nombres
 *    y el email de la cuenta desde su base de datos / sesión (evita manipular precios).
 *  - La respuesta se valida con paymentUrl (el backend v2 no devuelve "success").
 *  - Se muestra el mensaje real del backend (p. ej. "Stock insuficiente para X").
 *  - El botón sigue deshabilitado hasta que ocurre la redirección (antes se reactivaba durante el retraso de 1.5 s y
 *    permitía crear órdenes duplicadas).
 *  - Se eliminó el email del formulario (usaba `user` que no existía en el contexto) y el respaldo en sessionStorage
 *    que nadie leía. Estado de carrito vacío contemplado.
 *  - 8 campos repetidos → TextField + reglas compartidas.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import TextField from '../components/ui/TextField'
import { PageLoader } from '../components/ui/Spinner'
import { useCart } from '../context/CartContext'
import { getErrorMessage } from '../lib/http'
import { formatPrice } from '../lib/format'
import { phoneRules, textRules } from '../lib/validation'
import { createOrder } from '../services/orderServices'

/** toShippingInfo — del formulario plano a la forma anidada que espera el backend. */
const toShippingInfo = ({
  firstName,
  lastName,
  phone,
  street,
  number,
  city,
  state,
  zipCode,
}) => ({
  firstName,
  lastName,
  phone,
  address: { street, number, city, state, zipCode },
})

const Checkout = () => {
  const { items, total, loading } = useCart()
  const [redirecting, setRedirecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  if (loading) return <PageLoader label="Cargando carrito…" />

  if (items.length === 0) {
    return (
      <div className="mt-20 text-center">
        <p className="mb-4">Tu carrito está vacío.</p>
        <Link to="/" className="btn btn-primary">
          Ver productos
        </Link>
      </div>
    )
  }

  const onSubmit = async (data) => {
    try {
      const { paymentUrl } = await createOrder({
        items: items.map(({ _id, quantity }) => ({ id: _id, quantity })),
        shippingInfo: toShippingInfo(data),
      })
      setRedirecting(true) // mantiene el botón deshabilitado hasta que el navegador cambie de página
      toast.success('Orden creada. Redirigiendo a Mercado Pago…')
      window.location.assign(paymentUrl)
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Error al procesar la orden, intenta más tarde'),
      )
    }
  }

  const disabled = isSubmitting || redirecting

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section
          className="rounded-lg bg-base-100 p-6 shadow-lg"
          aria-labelledby="shipping-title"
        >
          <h2 id="shipping-title" className="mb-6 text-2xl font-semibold">
            Información de envío
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 lg:gap-6"
            noValidate
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              <TextField
                id="firstName"
                label="Nombre *"
                autoComplete="given-name"
                error={errors.firstName}
                {...register(
                  'firstName',
                  textRules('El nombre', { min: 2, max: 50 }),
                )}
              />
              <TextField
                id="lastName"
                label="Apellido *"
                autoComplete="family-name"
                error={errors.lastName}
                {...register(
                  'lastName',
                  textRules('El apellido', { min: 2, max: 50 }),
                )}
              />
            </div>

            <TextField
              id="phone"
              label="Teléfono *"
              type="tel"
              autoComplete="tel"
              error={errors.phone}
              {...register('phone', phoneRules)}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
              <div className="md:col-span-2">
                <TextField
                  id="street"
                  label="Calle / dirección *"
                  autoComplete="address-line1"
                  error={errors.street}
                  {...register(
                    'street',
                    textRules('La dirección', { min: 3, max: 100 }),
                  )}
                />
              </div>
              <TextField
                id="number"
                label="Número *"
                autoComplete="address-line2"
                error={errors.number}
                {...register('number', textRules('El número', { max: 20 }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              <TextField
                id="city"
                label="Ciudad *"
                autoComplete="address-level2"
                error={errors.city}
                {...register(
                  'city',
                  textRules('La ciudad', { min: 2, max: 60 }),
                )}
              />
              <TextField
                id="state"
                label="Departamento / provincia *"
                autoComplete="address-level1"
                error={errors.state}
                {...register(
                  'state',
                  textRules('El departamento', { min: 2, max: 60 }),
                )}
              />
            </div>

            <TextField
              id="zipCode"
              label="Código postal *"
              autoComplete="postal-code"
              error={errors.zipCode}
              {...register(
                'zipCode',
                textRules('El código postal', { min: 3, max: 20 }),
              )}
            />

            <button
              type="submit"
              disabled={disabled}
              className="btn btn-primary mt-6 w-full"
            >
              {disabled ? (
                <>
                  <span
                    className="loading loading-spinner"
                    aria-hidden="true"
                  />
                  Procesando…
                </>
              ) : (
                'Proceder al pago'
              )}
            </button>
          </form>
        </section>

        <section
          className="rounded-lg bg-base-100 p-6 shadow-lg"
          aria-labelledby="summary-title"
        >
          <h2 id="summary-title" className="mb-6 text-2xl font-semibold">
            Resumen de la orden
          </h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-xl font-bold">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            El total final lo confirma el servidor con los precios vigentes.
          </p>
        </section>
      </div>
    </div>
  )
}

export default Checkout
