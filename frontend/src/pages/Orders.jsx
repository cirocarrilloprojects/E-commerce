// E-commerce/frontend/src/pages/Orders.jsx

/**
 * ARCHIVO : src/pages/Orders.jsx
 * ROL     : "Mis órdenes": historial de compras del usuario con su estado.
 * LO USA  : AppRoutes.jsx (/orders, protegida). Antes los botones "Ver mis órdenes" apuntaban a una ruta que NO existía.
 * USA     : hooks/useFetch + services/orderServices.listOrders, lib/format.
 */
import { Link } from 'react-router'
import { PageLoader } from '../components/ui/Spinner'
import { useFetch } from '../hooks/useFetch'
import { formatDate, formatPrice } from '../lib/format'
import { listOrders } from '../services/orderServices'

const STATUS_LABELS = {
  pending: { text: 'Pendiente', badge: 'badge-warning' },
  in_process: { text: 'En proceso', badge: 'badge-info' },
  approved: { text: 'Pagada', badge: 'badge-success' },
  rejected: { text: 'Rechazada', badge: 'badge-error' },
  cancelled: { text: 'Cancelada', badge: 'badge-neutral' },
  needs_review: { text: 'En revisión', badge: 'badge-warning' },
}

const Orders = () => {
  const { data, loading, error, refetch } = useFetch(
    (signal) => listOrders(signal),
    [],
  )

  if (loading) return <PageLoader label="Cargando órdenes…" />

  if (error) {
    return (
      <div role="alert" className="mt-10 text-center">
        <p className="text-error">
          No se pudieron cargar tus órdenes: {error.message}
        </p>
        <button className="btn btn-outline btn-sm mt-3" onClick={refetch}>
          Reintentar
        </button>
      </div>
    )
  }

  const { orders } = data

  return (
    <section className="mt-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Mis órdenes</h1>
      {orders.length === 0 ? (
        <p className="text-center">
          Aún no tienes órdenes.{' '}
          <Link className="link" to="/">
            Ver productos
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <caption className="sr-only">Historial de órdenes</caption>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Productos</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = STATUS_LABELS[order.status] ?? {
                  text: order.status,
                  badge: 'badge-ghost',
                }
                return (
                  <tr key={order._id}>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.products
                        .map((p) => `${p.name} ×${p.quantity}`)
                        .join(', ')}
                    </td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${status.badge}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Orders
