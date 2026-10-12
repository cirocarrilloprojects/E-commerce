//E-commerce/frontend/src/components/Navbar/CartButtons.jsx
/**
 * ARCHIVO : src/components/Navbar/CartButtons.jsx
 * ROL     : botón del carrito con contador de artículos; abre el modal del carrito.
 * LO USA  : Navbar.jsx.   USA: CartContext (itemsQuantity, openModal).
 *
 * CORRECCIÓN VISUAL: el contador ahora es un círculo perfecto.
 *   - Se eliminó <span className="indicator"> / <span className="badge indicator-item badge-sm">
 *     porque en DaisyUI 5 esas clases no garantizan un círculo real (el badge-sm es rectangular
 *     con esquinas redondeadas pequeñas y no centra el número).
 *   - Ahora se usa posición absoluta + tamaño fijo (h-5 min-w-5) + rounded-full + flex centrado.
 *   - min-w-5 (en vez de w-5) permite que números de 2 dígitos (10+) crezcan horizontalmente
 *     sin deformarse: con 1 dígito queda circular, con 2+ queda "pastilla" redondeada.
 */
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'

const CartButton = () => {
  const { itemsQuantity, openModal } = useCart()

  return (
    <button
      type="button"
      onClick={openModal}
      className="btn btn-success btn-circle relative"
      aria-label={`Abrir carrito, ${itemsQuantity} artículos`}
    >
      <FaShoppingCart size={18} aria-hidden="true" />

      {itemsQuantity > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-base-300 bg-base-100 px-1 text-xs font-bold text-base-content">
          {itemsQuantity}
        </span>
      )}
    </button>
  )
}

export default CartButton
