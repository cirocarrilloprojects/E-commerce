// E-commerce/frontend/src/components/admin/ProductsTable.jsx
/**
 * ARCHIVO : src/components/admin/ProductsTable.jsx
 * ROL     : tabla presentacional de productos para el panel de administración (solo dibuja; no hace peticiones).
 * LO USA  : pages/admin/AdminProducts.jsx.   RECIBE: products, onDelete(product), deletingId.
 * CAMBIOS : antes llamaba a deleteProduct del contexto y hacía toast + console.log dentro de la tabla (mezcla de
 *           presentación y lógica); ahora emite onDelete y el contenedor decide. Se añadió <caption>, scope="col",
 *           miniatura de imagen en lugar de la URL como texto, confirmación y estado vacío; cabeceras en español.
 */
import { Link } from 'react-router'
import { formatPrice } from '../../lib/format'

const ProductsTable = ({ products, onDelete, deletingId }) => {
  if (products.length === 0)
    return <p className="py-8 text-center">Aún no hay productos.</p>

  return (
    <table className="table text-center">
      <caption className="sr-only">Listado de productos</caption>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Imagen</th>
          <th scope="col">Nombre</th>
          <th scope="col">Descripción</th>
          <th scope="col">Precio</th>
          <th scope="col">Stock</th>
          <th scope="col">Editar</th>
          <th scope="col">Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <tr key={product._id}>
            <th scope="row">{index + 1}</th>
            <td>
              <img
                src={product.imageUrl}
                alt=""
                className="mx-auto h-12 w-12 rounded object-cover"
                loading="lazy"
              />
            </td>
            <td>{product.name}</td>
            <td className="max-w-xs truncate">{product.description}</td>
            <td>{formatPrice(product.price)}</td>
            <td>{product.stock}</td>
            <td>
              <Link
                to={`/admin/dashboard/products/updateProduct/${product._id}`}
                className="btn btn-info btn-sm"
              >
                Editar
              </Link>
            </td>
            <td>
              <button
                className="btn btn-error btn-sm"
                onClick={() => onDelete(product)}
                disabled={deletingId === product._id}
              >
                {deletingId === product._id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProductsTable
