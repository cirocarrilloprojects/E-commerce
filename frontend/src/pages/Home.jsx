// E-commerce/frontend/src/pages/Home.jsx
/**
 * ARCHIVO : src/pages/Home.jsx
 * ROL     : portada con el catálogo paginado (la página vive en la URL: /?page=2, por eso se puede compartir y funciona
 *           el botón "atrás").
 * USA     : hooks/useProducts, ProductCard, Pagination.   LO USA: AppRoutes.jsx (ruta "/").
 * MANEJA los 4 estados: cargando, error (con reintento), vacío y datos.
 */
import { useSearchParams } from 'react-router'
import Pagination from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'
import ProductCard from '../components/products/ProductCard'
import { useProducts } from '../hooks/useProducts'
import { PAGE_SIZE } from '../lib/config'

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, loading, error, refetch } = useProducts({
    page,
    limit: PAGE_SIZE,
  })

  return (
    <div>
      <h1 className="mt-7 mb-2 text-center text-4xl font-bold text-purple-700 uppercase">
        Mi Ecommerce
      </h1>
      <p className="mb-4 text-center">Elige un producto</p>

      {loading && (
        <div className="flex justify-center">
          <Spinner label="Cargando productos…" />
        </div>
      )}

      {error && (
        <div role="alert" className="text-center">
          <p className="text-error">
            No se pudieron cargar los productos: {error.message}
          </p>
          <button className="btn btn-outline btn-sm mt-3" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {data && data.products.length === 0 && (
        <p className="text-center">No hay productos disponibles.</p>
      )}

      {data && data.products.length > 0 && (
        <>
          <div className="flex flex-wrap justify-center gap-6">
            {data.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination
            page={page}
            total={data.total}
            limit={PAGE_SIZE}
            onChange={(p) => setSearchParams({ page: p })}
          />
        </>
      )}
    </div>
  )
}

export default Home
