/**
 * ARCHIVO : src/components/navbar/CartModal.jsx
 * ROL     : ventana del carrito: lista de productos, cantidades, total y acciones.
 * LO USA  : Navbar.jsx.   USA: CartContext, lib/format.
 *
 * MEJORAS: usa el elemento nativo <dialog> + showModal(): el navegador aporta gratis el foco atrapado, el cierre con Esc
 * y aria-modal (antes era un <div> sin semántica de diálogo). Los botones se deshabilitan con `busy` en vez de reemplazar
 * toda la lista por un spinner (no más parpadeo). Se corrigieron: el stock 0 tratado como 999, el precio sin formato y
 * la clase "textl-lg".
 */
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { CgTrash } from 'react-icons/cg'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../lib/format'
import { Spinner } from '../ui/Spinner'

const CartModal = () => {
  const dialogRef = useRef(null)
  const {
    items,
    itemsQuantity,
    total,
    loading,
    busy,
    isModalOpen,
    closeModal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  // Sincroniza el estado de React con el <dialog> nativo.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isModalOpen && !dialog.open) dialog.showModal()
    if (!isModalOpen && dialog.open) dialog.close()
  }, [isModalOpen])

  const handleClear = () => {
    if (window.confirm('¿Seguro que quieres vaciar el carrito?')) clearCart()
  }

  return (
    // onClose se dispara con Esc, con el botón de cerrar y con el clic en el fondo (formulario method="dialog").
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={closeModal}
      aria-labelledby="cart-title"
    >
      <section className="modal-box max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="cart-title" className="text-lg font-bold">
            Carrito de compras
          </h2>
          <form method="dialog">
            <button
              className="btn btn-circle btn-ghost btn-sm"
              aria-label="Cerrar carrito"
            >
              ✕
            </button>
          </form>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <Spinner label="Cargando carrito…" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            Tu carrito está vacío
          </p>
        ) : (
          <>
            <ul className="flex max-h-96 flex-col gap-4 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="flex flex-wrap items-center gap-4"
                >
                  <img
                    className="aspect-square h-20 w-20 rounded object-cover"
                    src={item.imageUrl}
                    alt={item.name}
                  />
                  <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          disabled={busy || item.quantity <= 1}
                          aria-label={`Quitar una unidad de ${item.name}`}
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="px-4 font-medium" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          disabled={busy || item.quantity >= item.stock}
                          aria-label={`Agregar una unidad de ${item.name}`}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>

                      <span className="text-lg font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeItem(item._id)}
                        disabled={busy}
                        aria-label={`Eliminar ${item.name} del carrito`}
                      >
                        <CgTrash size={19} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t pt-4">
              <div className="mb-2 flex justify-between">
                <span>Total de artículos:</span>
                <span className="font-semibold">{itemsQuantity}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="modal-action flex-col gap-2 lg:flex-row lg:justify-between">
              <button
                onClick={handleClear}
                disabled={busy}
                className="btn btn-error"
              >
                Vaciar carrito
              </button>
              <Link className="btn btn-info" onClick={closeModal} to="/">
                Seguir comprando
              </Link>
              <Link
                className="btn btn-primary"
                onClick={closeModal}
                to="/checkout"
              >
                Proceder al pago
              </Link>
            </div>
          </>
        )}
      </section>

      <form method="dialog" className="modal-backdrop">
        <button aria-label="Cerrar">cerrar</button>
      </form>
    </dialog>
  )
}

export default CartModal
