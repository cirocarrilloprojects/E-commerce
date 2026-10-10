//E-commerce/frontend/src/components/Navbar/Cart.jsx

import { FaShoppingCart } from 'react-icons/fa'
import { useNavigate } from 'react-router'

const Cart = ({ items = [], subtotal = 0 }) => {
  const navigate = useNavigate()
  const itemCount = items.length

  return (
    <div className="flex-none">
      <div className="dropdown dropdown-end">
        <button
          type="button"
          className="btn btn-success btn-circle"
          aria-label="Abrir carrito"
        >
          <div className="indicator">
            <FaShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="badge badge-sm indicator-item">{itemCount}</span>
            )}
          </div>
        </button>

        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-100 z-1000 mt-3 w-52 shadow"
        >
          <div className="card-body">
            <span className="text-lg font-bold">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="text-info">subtotal: ${subtotal.toFixed(2)}</span>
            <div className="card-actions justify-end">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => navigate('/cart')}
              >
                Ver carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
