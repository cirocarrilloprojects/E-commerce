// E-commerce/frontend/src/context/ProductContext.jsx
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL + '/products'

export const ProductContext = createContext({})

export const ProductContextProvider = ({ children }) => {
  // Estado de la lista
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)

  // Estado de un producto individual
  const [product, setProduct] = useState({})
  const [productLoading, setProductLoading] = useState(false)
  const [productError, setProductError] = useState(null)

  // Obtener todos los productos
  const getProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError(null)
    try {
      const response = await axios.get(API_URL)
      setProducts(response.data)
    } catch (error) {
      setProductsError(error.message || 'Error al obtener los productos')
    } finally {
      setProductsLoading(false)
    }
  }, [])

  // Obtener un producto por ID
  const getProductById = useCallback(async (id) => {
    setProductLoading(true)
    setProductError(null)
    try {
      const response = await axios.get(`${API_URL}/${id}`)
      setProduct(response.data)
    } catch (error) {
      setProductError(error.message || 'Error al obtener el producto')
    } finally {
      setProductLoading(false)
    }
  }, [])

  useEffect(() => {
    getProducts()
  }, [getProducts])

  const value = {
    products,
    productsLoading,
    productsError,
    product,
    productLoading,
    productError,
    getProducts,
    getProductById,
  }

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  )
}

export const useProduct = () => useContext(ProductContext)
