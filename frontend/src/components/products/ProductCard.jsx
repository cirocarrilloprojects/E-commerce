//E-commerce/frontend/src/components/products/ProductCard.jsx
/**
 * ARCHIVO : src/components/products/ProductCard.jsx
 * ROL     : tarjeta de un producto en el listado (imagen, nombre, precio, descripción, acciones).
 * LO USA  : pages/Home.jsx.   USA: AddToCartButton, lib/format.
 * MEJORAS : lazy loading de la imagen y dimensiones (evita saltos de diseño); precio formateado; sin variables sin usar
 *           (antes importaba useUser/isAuthenticated y no los usaba); archivo con nombre PascalCase como el componente.
 */
import { Link } from 'react-router'
import { formatPrice } from '../../lib/format'
import AddToCartButton from './AddToCartButton'

const ProductCard = ({ product }) => {
  const { _id, name, price, imageUrl, description } = product

  return (
    <article className="card w-80 bg-base-100 shadow-lg">
      <figure>
        <img
          className="aspect-square object-cover"
          src={imageUrl}
          alt={name}
          loading="lazy"
          width="320"
          height="320"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <div className="badge badge-warning">{formatPrice(price)}</div>
        <p className="line-clamp-2">{description}</p>
        <div className="card-actions mt-4 justify-between">
          <Link
            to={`/detailProduct/${_id}`}
            className="btn btn-sm btn-info md:btn-md"
          >
            Ver detalles
          </Link>
          <AddToCartButton product={product} className="btn-sm md:btn-md" />
        </div>
      </div>
    </article>
  )
}

export default ProductCard
