// E-commerce/frontend/src/pages/DetailProduct.jsx
/**
 * ARCHIVO : src/pages/DetailProduct.jsx
 * ROL     : detalle de un producto (/detailProduct/:id).
 * USA     : hooks/useProduct, AddToCartButton, lib/format.
 * CORREGIDO: el botón "Agregar al carrito" no hacía nada; al cambiar de producto se veía un instante el anterior
 *            (ahora useFetch reinicia los datos y cancela la petición previa); el error se distingue de "no encontrado".
 */
import { useParams } from 'react-router'
import { Spinner } from '../components/ui/Spinner'
import AddToCartButton from '../components/products/AddToCartButton'
import { useProduct } from '../hooks/useProducts'
import { formatPrice } from '../lib/format'

const DetailProduct = () => {
  const { id } = useParams()
  const { data: product, loading, error } = useProduct(id)

  if (loading) {
    return (
      <div className="mt-10 flex justify-center">
        <Spinner label="Cargando producto…" />
      </div>
    )
  }

  if (error) {
    return (
      <p role="alert" className="mt-10 text-center text-error">
        {error.status === 404
          ? 'Producto no encontrado'
          : `Error: ${error.message}`}
      </p>
    )
  }

  return (
    <div className="mt-6 gap-8 md:flex">
      <div className="md:w-1/2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full rounded-lg object-cover"
        />
      </div>
      <section className="flex flex-col gap-5 pt-2 md:w-1/2 md:pt-0">
        <h1 className="text-5xl font-bold">{product.name}</h1>
        <p className="badge badge-warning p-4 text-xl font-bold">
          {formatPrice(product.price)}
        </p>
        <p className="text-lg">{product.description}</p>
        <p className="text-sm opacity-70">Stock: {product.stock}</p>
        <AddToCartButton
          product={product}
          className="mt-2 md:btn-lg md:mt-auto"
        />
      </section>
    </div>
  )
}

export default DetailProduct
