//E-commerce/frontend/src/components/Navbar/CartButtons.jsx
/**
 * ARCHIVO : src/components/navbar/CartButton.jsx
 * ROL     : botón del carrito con contador de artículos; abre el modal del carrito.
 * LO USA  : Navbar.jsx.   USA: CartContext (itemsQuantity, openModal).
 * CAMBIO  : se eliminó el dropdown intermedio y el hack document.activeElement.blur(); el botón abre el modal directo.
 */
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'

const CartButton = () => {
  const { itemsQuantity, openModal } = useCart()

  return (
    <button
      type="button"
      onClick={openModal}
      className="btn btn-success btn-circle"
      aria-label={`Abrir carrito, ${itemsQuantity} artículos`}
    >
      <span className="indicator">
        <FaShoppingCart size={18} aria-hidden="true" />
        <span className="badge indicator-item badge-sm">{itemsQuantity}</span>
      </span>
    </button>
  )
}

export default CartButton
