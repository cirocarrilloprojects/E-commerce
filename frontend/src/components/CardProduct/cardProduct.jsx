// E-commerce/frontend/src/components/CardProduct/cardProduct.jsx
import { Link } from 'react-router'
import { useUser } from '../../context/UserContext.jsx'
import { FaShoppingCart } from 'react-icons/fa'

const CardProduct = ({ product }) => {
  const { isAuthenticated } = useUser()
  const { _id, name, price, imageUrl, description, stock } = product

  return (
    <div className="card bg-base-100 w-80 shadow-lg">
      <figure>
        <img className="aspect-square object-cover" src={imageUrl} alt={name} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <div className="badge badge-warning">${price}</div>
        <p className="line-clamp-2">{description}</p>
        <div className="card-actions justify-between mt-4">
          <Link
            to={`/detailProduct/${_id}`}
            className="btn btn-info btn-sm md:btn-md"
          >
            Ver Detalles
          </Link>
          <button className="btn btn-success btn-sm md:btn-md">
            <FaShoppingCart size={16} />
            {stock === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardProduct
