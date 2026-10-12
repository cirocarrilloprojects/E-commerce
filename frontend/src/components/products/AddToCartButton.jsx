//E-commerce/frontend/src/components/products/AddToCartButton.jsx
/**
 * ARCHIVO : src/components/products/AddToCartButton.jsx
 * ROL     : botón "Agregar al carrito" que realmente agrega (en el código anterior los botones de CardProduct y de
 *           DetailProduct NO tenían onClick). Se deshabilita sin stock o mientras el carrito está ocupado.
 * LO USA  : ProductCard, pages/DetailProduct.   USA: CartContext.addItem.
 */
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'

const AddToCartButton = ({ product, className = '' }) => {
  const { addItem, busy } = useCart()
  const soldOut = product.stock === 0

  return (
    <button
      type="button"
      className={`btn btn-success ${className}`}
      onClick={() => addItem(product)}
      disabled={soldOut || busy}
    >
      <FaShoppingCart size={16} aria-hidden="true" />
      {soldOut ? 'Sin stock' : 'Agregar'}
    </button>
  )
}

export default AddToCartButton
