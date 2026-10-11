// E-commerce/frontend/src/pages/DetailProduct.jsx
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useProduct } from '../context/ProductContext.jsx'

const DetailProduct = () => {
  const { id } = useParams() // ✅ con ()
  const { getProductById, product, productLoading, productError } = useProduct()

  useEffect(() => {
    if (id) getProductById(id)
  }, [id, getProductById])

  if (productLoading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (productError) {
    return (
      <p className="text-center mt-10 text-red-500">Error: {productError}</p>
    )
  }

  if (!product || !product._id) {
    return <p className="text-center mt-10">Producto no encontrado</p>
  }

  return (
    <div className="mt-6 md:flex gap-8">
      <div className="md:w-1/2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover rounded-lg"
        />
      </div>
      <section className="flex flex-col gap-5 pt-2 md:pt-0 md:w-1/2">
        <h1 className="text-5xl font-bold">{product.name}</h1>
        <p className="text-xl badge badge-warning p-4 font-bold">
          ${product.price}
        </p>
        <p className="text-lg">{product.description}</p>
        <p className="text-sm opacity-70">Stock: {product.stock}</p>
        <button className="btn btn-success mt-2 md:mt-auto md:btn-lg">
          Agregar al carrito
        </button>
      </section>
    </div>
  )
}

export default DetailProduct
