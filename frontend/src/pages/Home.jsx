// E-commerce/frontend/src/pages/Home.jsx
import CardProduct from '../components/CardProduct/cardProduct'
import { useProduct } from '../context/ProductContext'

const Home = () => {
  const { products, productsLoading, productsError } = useProduct()

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-7 mb-2 text-purple-700 uppercase">
        MI ECOMMERCE
      </h1>
      <p className="text-center mb-4">Elige un producto</p>
      <div className="flex flex-wrap gap-6 justify-center">
        {productsLoading ? (
          <div className="loading loading-spinner loading-lg"></div>
        ) : productsError ? (
          <p className="text-red-500">
            Error al cargar los productos: {productsError}
          </p>
        ) : products.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          products.map((product) => (
            <CardProduct key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  )
}

export default Home
