// E-commerce/frontend/src/components/AdminDasboard/TableProductDashboard/TableProductDashboard.jsx
import { Link } from 'react-router'
import { useProduct } from '../../../Context/ProductContext'
import TableProducts from './TableProducts'

const TableProductDashboard = () => {
  const { products, producstLoding } = useProduct()

  return (
    <>
      <div className="flex items-center gap-4 justify-center">
        <h1>Admin Productos</h1>
        <Link
          to="/admin/dashboard/products/createProduct"
          className="btn btn-primary"
        >
          Crear Producto
        </Link>
      </div>
      <div className="overflow-x-auto">
        {producstLoding ? (
          <div className="loading loading-spinner"></div>
        ) : (
          <TableProducts products={products} />
        )}
      </div>
    </>
  )
}

export default TableProductDashboard
