// E-commerce/frontend/src/pages/admin/AdminProducts.jsx

/**
 * ARCHIVO : src/pages/admin/CreateProduct.jsx
 * ROL     : página "Crear producto". USA: ProductForm + productServices.createProduct.
 * LO USA  : AppRoutes.jsx (/admin/dashboard/products/createProduct).
 */
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import ProductForm from '../../components/products/ProductForm'
import { createProduct } from '../../services/productServices'

const CreateProduct = () => {
  const navigate = useNavigate()

  const handleCreate = async (values) => {
    await createProduct(values) // si falla, ProductForm muestra el mensaje del backend
    toast.success('Producto creado exitosamente')
    navigate('/admin/dashboard/products')
  }

  return (
    <div>
      <h1 className="my-10 text-center text-3xl font-bold">Crear producto</h1>
      <ProductForm onSubmit={handleCreate} submitLabel="Crear producto" />
    </div>
  )
}

export default CreateProduct
