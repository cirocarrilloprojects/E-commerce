// E-commerce/frontend/src/pages/admin/AdminProducts.jsx

/**
 * ARCHIVO : src/pages/admin/AdminProducts.jsx
 * ROL     : contenedor del listado de productos del panel admin (carga datos, borra y refresca).
 * LO USA  : AppRoutes.jsx (/admin/dashboard/products).   USA: hooks/useProducts, ProductsTable, productServices.deleteProduct.
 * CORREGIDO: leía "producstLoding" (typo) → el indicador de carga nunca aparecía; ahora hay carga, error y paginación.
 *            La lógica (borrar, toast, refetch) vive aquí, no dentro de la tabla.
 */
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import toast from 'react-hot-toast'
import ProductsTable from '../../components/admin/ProductsTable'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import { useProducts } from '../../hooks/useProducts'
import { PAGE_SIZE } from '../../lib/config'
import { getErrorMessage } from '../../lib/http'
import { deleteProduct } from '../../services/productServices'

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, loading, error, refetch } = useProducts({
    page,
    limit: PAGE_SIZE,
  })
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      )
    )
      return
    setDeletingId(product._id)
    try {
      await deleteProduct(product._id)
      toast.success('Producto eliminado')
      refetch()
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar el producto'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="my-6 flex items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Admin productos</h1>
        <Link
          to="/admin/dashboard/products/createProduct"
          className="btn btn-primary"
        >
          Crear producto
        </Link>
      </div>

      {loading && <PageLoader label="Cargando productos…" />}
      {error && (
        <p role="alert" className="text-center text-error">
          {error.message}{' '}
          <button className="btn btn-outline btn-sm" onClick={refetch}>
            Reintentar
          </button>
        </p>
      )}
      {data && (
        <div className="overflow-x-auto">
          <ProductsTable
            products={data.products}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
          <Pagination
            page={page}
            total={data.total}
            limit={PAGE_SIZE}
            onChange={(p) => setSearchParams({ page: p })}
          />
        </div>
      )}
    </>
  )
}

export default AdminProducts
