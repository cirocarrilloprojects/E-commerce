// E-commerce/frontend/src/pages/admin/AdminProducts.jsx

/**
 * ARCHIVO : src/pages/admin/UpdateProduct.jsx
 * ROL     : página "Actualizar producto": carga el producto y lo muestra en ProductForm.
 * LO USA  : AppRoutes.jsx (/admin/dashboard/products/updateProduct/:id).   USA: useProduct, ProductForm.
 * CORREGIDO: antes el formulario se montaba con product = {} y useForm({ defaultValues }) solo lee los valores en el
 *            PRIMER render → el formulario quedaba vacío. Ahora ProductForm se monta únicamente cuando el producto ya llegó.
 */
import { useNavigate, useParams } from 'react-router'
import toast from 'react-hot-toast'
import ProductForm from '../../components/products/ProductForm'
import { PageLoader } from '../../components/ui/Spinner'
import { useProduct } from '../../hooks/useProducts'
import { updateProduct } from '../../services/productServices'

const UpdateProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: product, loading, error } = useProduct(id)

  const handleUpdate = async (values) => {
    await updateProduct(id, values)
    toast.success('Producto actualizado')
    navigate('/admin/dashboard/products')
  }

  return (
    <div>
      <h1 className="my-10 text-center text-3xl font-bold">
        Actualizar producto
      </h1>
      {loading && <PageLoader label="Cargando producto…" />}
      {error && (
        <p role="alert" className="text-center text-error">
          {error.status === 404 ? 'Producto no encontrado' : error.message}
        </p>
      )}
      {product && (
        <ProductForm
          defaultValues={{
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl,
          }}
          onSubmit={handleUpdate}
          submitLabel="Actualizar producto"
        />
      )}
    </div>
  )
}

export default UpdateProduct
