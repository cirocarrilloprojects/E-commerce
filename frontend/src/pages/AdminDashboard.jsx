// E-commerce/frontend/src/pages/AdminDashboard.jsx
import { Routes, Route } from 'react-router'
import TableProductDashboard from '../Components/AdminDashboard/TableProductDashboard/TableProductDashboard'
import DashboardLayout from '../Layout/DashboardLayout'
import CreateProduct from './CreateProduct'
import UpdateProduct from './UpdateProducts'

const AdminDashboard = () => {
  return (
    <section>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<TableProductDashboard />} />
          <Route path="products" element={<TableProductDashboard />} />
          <Route path="products/createProduct" element={<CreateProduct />} />
          <Route
            path="products/updateProduct/:id"
            element={<UpdateProduct />}
          />
        </Route>
      </Routes>
    </section>
  )
}

export default AdminDashboard
