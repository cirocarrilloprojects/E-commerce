// E-commerce/frontend/src/pages/UpdateProducts.jsx
import UpdateProductForm from '../Components/AdminDashboard/UpdateProductForm/UpdateProductForm'
import { useParams } from 'react-router'
import { useProduct } from '../Context/ProductContext'
import { useEffect } from 'react'

const UpdateProduct = () => {
  const { id } = useParams()
  const { getProductById, product, productLoading } = useProduct()

  useEffect(() => {
    getProductById(id)
  }, [id, getProductById])

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-10">
        Actualizar producto
      </h1>
      {productLoading ? (
        <div className="loading loading-spinner"></div>
      ) : (
        <UpdateProductForm product={product} />
      )}
    </div>
  )
}

export default UpdateProduct
