// E-commerce/frontend/src/context/CartContext.jsx
import { createContext, useState, useEffect, useContext, Children } from 'react'
import { useUser } from './UserContext'

import {
  addToCartService,
  getCartSevice,
  updateCartService,
  removeFromCartService,
  clearCartservice,
  getCartTotalService,
} from '../services/cartServices'
import toast from 'react-hot-toast'

export const CartContext = createContext({})

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [itemsQuantity, setItemsQuantity] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { getUserId, isAuthenticated } = useUser()

  // funcion para cargar el carrito desde localStorage
  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem('cart')
      return localCart ? JSON.parse(localCart) : []
    } catch (error) {
      console.error('Error al cargar el carrito local:'.error)
      return []
    }
  }

  // funcion para guardar el carrito en el localStorage
  const saveLocalCart = (cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } catch (error) {
      console.error('Error al guardar carrito local', error)
    }
  }
  // funcion para caargar el carrito en el backend o en local storage
  const loadCart = async () => {
    if (isAuthenticated()) {
      //Usuario autenticado: cargar desde backend
      try {
        setLoading(true)
        const userId = getUserId()
        const response = await getCartSevice(userId)
        // tranformar los datos del backend al formato del frontend
        const cartItems = response.cart?.products?.map(
          (item) =>
            (({ _id: item.productId._id }),
            { name: item.productId.name },
            { price: item.productId.price },
            { imageUrl: item.productId.imageUrl },
            { description: item.productId.description },
            { stock: item.productId.stock },
            { quantity: item.quantity }) || [],
        )
        setCart(cartItems)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    } else {
      // ususario no autenticado: carga desde el local store
      const localCart = loadLocalCart()
      setCart(localCart)
      setLoading(false)
    }
  }
  // Funcion para sincronizar carrito local con el backend
  const syncCartWithBackend = async () => {
    const localCart = loadLocalCart()
    if (localCart.length > 0 && isAuthenticated()) {
      try {
        setLoading(true)
        const userId = getUserId()
        // Agregar cada producto del carrito local al backend
        for (const item of localCart) {
          try {
            await addToCartService(userId, item._id, item.quantity)
          } catch (error) {
            console.error(`error al sincronizar producto ${item.name}`)
          }
        }
        // limpiar Localstorage despues de sincronizar
        localStorage.removeItem('cart')
        // recargar carrito desde el backend
        await loadCart()
        toast.success('carrito sincronizado con exito')
      } catch (error) {
        console.error('Error al sincronizar carrito', error)
      } finally {
        setLoading(false)
      }
    }
  }
  // cargar carrito al inicializar
  useEffect(() => {
    let isMounted = true

    const initializeCart = async () => {
      // Esperar un poco para que el UserContext se estabilice
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (!isMounted) return

      const previousAuthState = localStorage.getItem('wasAuthenticated')
      const currentAuthState = isAuthenticated()

      if (!previousAuthState && currentAuthState) {
        // usuario acaba de iniciar sesion: sincronizar el carrito local
        await syncCartWithBackend()
      } else {
        //cargar carrito normalmente
        await loadCart()
      }
      //guardar estado de autenticacion actual
      localStorage.setItem('wasAuthenticated', currentAuthState.toString())
      setLoading(false)
    }
    initializeCart()
    return () => {
      isMounted = false
    }
  }, [])

  // añadir producto al carrito
  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated()) {
      try {
        setLoading(true)
        const userId = getUserId()
        await addToCartService(userId, product._id, quantity)
        // recargar el carrito despues de agregar
        await loadCart()
        toast.success('producto agregado al carrito')
      } catch (error) {
        console.error('Error al agregar prodcuto al carrito', error)
        toast.error('Error al agregar producto al carrito')
      } finally {
        setLoading(false)
      }
    } else {
      // Usuario no autenticado: usar localStorage
      try {
        const currentCart = [...cart]
        const existingIndex = currentCart.findIndex(
          (item) => item._id === product._id,
        )
        if (existingIndex > -1) {
          // producto ya existe, actualizar cantidad
          currentCart[existingIndex].quantity += quantity
        } else {
          // nuevo producto: agregar
          currentCart.push({ ...product, quantity })
        }
        setCart(currentCart)
        saveLocalCart(currentCart)
        toast.success('Producto agregar al carrito')
      } catch (error) {
        console.error('Error al agregar al carrito local:', error)
        toast.error('Error al agregar producto del carrito')
      }
    }
  }

  // eliminar producto del carrito
  const removeFromCart = async (productId) => {
    if (isAuthenticated()) {
      try {
        setLoading(true)
        const userId = getUserId()
        await removeFromCartService(userId, productId)

        // recargar el carrito despues de eliminar
        await loadCart()
        toast.success('producto eliminado del carrito')
      } catch (error) {
        console.error(
          'Error al agregar al eliminar producto del carrito',
          error,
        )
        toast.error('Error al eliminar producto al carrito')
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const currentCart = cart.filter((item) => item._id !== productId)
        setCart(currentCart)
        saveLocalCart(currentCart)
        toast.success('producto eliminado del carrito')
      } catch (error) {
        console.error(
          'Error al agregar al eliminar producto del carrito local:',
          error,
        )
        toast.error('Error al eliminar producto del carrito local')
      }
    }
  }

  // actualizar cantidad de producto
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('la cantidad debe ser al menos 1')
      return
    }
    if (isAuthenticated()) {
      try {
        setLoading(true)
        const userId = getUserId()
        await updateCartService(userId, productId, newQuantity)
        // recargar el carrito despues de actualizar
        await loadCart()
        toast.success('Cantidad actualizada')
      } catch (error) {
        console.error('Error al actualizar la cantiad:', error)
        toast.error('Error al eliminar producto del carrito local')
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const currentCart = cart.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item,
        )
        setCart(currentCart)
        saveLocalCart(currentCart)
        toast.success('Cantidad actualizada')
      } catch (error) {
        console.error('Error al agregar al actualizar la cantidad local', error)
        toast.error('Error al agregar al actualizar cantidad')
      }
    }
  }
  // limpiar el carrito
  const clearCart = async () => {
    if (isAuthenticated()) {
      try {
        setLoading(true)
        const userId = getUserId()
        await clearCartservice(userId)
        // limpiar el estado local
        setCart([])
        toast.success('Carrito vacio')
      } catch (error) {
        console.error('Error al agregar al vaciar el carrito', error)
        toast.error('Error al vaciar el carrito')
      } finally {
        setLoading(false)
      }
    } else {
      try {
        setCart([])
        saveLocalCart([])
        toast.success('Carrito vacio')
      } catch (error) {
        console.error('Error al agregar al vaciar el carrito local', error)
        toast.error('Error al agregar al vaciar el carrito local')
      }
    }
  }

  // Escuchar cambios de autentificacion por separado
  useEffect(() => {
    const previousAuthState =
      localStorage.getItem('wasAuthenticated') === 'true'
    const currentAuthState = isAuthenticated()
    // solo actuar si realmente cambio el estado de autenticacion
    if (previousAuthState !== currentAuthState && cart.length === 0) {
      loadCart()
      localStorage.setItem('wasAuthenticated', currentAuthState.toString())
    }
  }, [])

  // calcular el total y cantidad de items cuando cambia el carrito
  useEffect(() => {
    const newTotal = cart.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0,
    )
    setTotal(newTotal)

    const newItemsQuantity = cart.reduce(
      (acc, item) => acc + (item.quantity || 1),
      0,
    )
    setItemsQuantity(newItemsQuantity)
  }, [cart])

  // abrir modal
  const openModal = () => setIsModalOpen(true)
  // cerrar el modal
  const closeModal = () => setIsModalOpen(false)
  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        itemsQuantity,
        isModalOpen,
        closeModal,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        openModal,
        updateQuantity,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
