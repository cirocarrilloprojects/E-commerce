// E-commerce/frontend/src/context/CartContext.jsx
/**
 * ARCHIVO : src/context/CartContext.jsx
 * CAPA    : estado global del CARRITO
 * ROL     : un carrito con dos "fuentes": invitado → localStorage; usuario logueado → backend (/api/cart).
 *           Al iniciar sesión, el carrito de invitado se fusiona con el del servidor.
 * LO USA  : App.jsx (lo monta), Navbar/CartButton, CartModal, AddToCartButton, Checkout, PaymentResult.
 * USA     : UserContext (¿hay sesión?), services/cartServices.js, localStorage.
 * LO GENERA: { items, total, itemsQuantity, loading, busy, isModalOpen, addItem, updateQuantity, removeItem, clearCart,
 *              openModal, closeModal }.   items[i] = { _id, name, price, imageUrl, stock, quantity }.
 *
 * ERRORES DEL CÓDIGO ANTERIOR QUE CORRIGE:
 *  - loadCart usaba una expresión con operador coma:  ((({_id}), {name}, … {quantity}) || [])  → cada ítem quedaba
 *    solo con { quantity } (sin nombre, precio ni imagen). Ahora hay una función de mapeo clara (fromBackend).
 *  - Llamaba isAuthenticated()/getUserId() que no eran funciones → TypeError. Ahora usa useUser().isAuthenticated.
 *  - Detectaba el login con un truco (localStorage "wasAuthenticated" + setTimeout de 100 ms + dos useEffect).
 *    Ahora UN efecto depende de [authLoading, isAuthenticated] y reacciona a login y logout.
 *  - total e itemsQuantity eran useState + useEffect (render extra y estado duplicado): son DATOS DERIVADOS → useMemo.
 *  - Cada acción recargaba todo el carrito y ponía loading=true (la lista parpadeaba). Ahora se usa la respuesta de la
 *    mutación (el backend devuelve el carrito actualizado) y un flag `busy` que solo deshabilita botones.
 *  - catch vacío y console.error('texto'.error): ahora se muestra el mensaje real del backend con un toast.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { useUser } from './UserContext'
import * as cartApi from '../services/cartServices'
import { getErrorMessage, isCanceled } from '../lib/http'

const CartContext = createContext(null)
const LOCAL_KEY = 'cart'

// ── Carrito de invitado (localStorage) ──────────────────────────────────────
const readLocalCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
const writeLocalCart = (items) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('No se pudo guardar el carrito local:', error)
  }
}
/** takeLocalCart — lee Y BORRA el carrito de invitado (así una fusión nunca se ejecuta dos veces). */
const takeLocalCart = () => {
  const items = readLocalCart()
  localStorage.removeItem(LOCAL_KEY)
  return items
}

/** toCartItem — reduce un producto a los campos que necesita el carrito. */
const toCartItem = (product, quantity) => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  imageUrl: product.imageUrl,
  stock: product.stock,
  quantity,
})

/** fromBackend — convierte { products:[{ productId:{…producto}, quantity }] } (respuesta del backend) en items planos. */
const fromBackend = (cart) =>
  (cart?.products ?? []).map(({ productId: product, quantity }) =>
    toCartItem(product, quantity),
  )

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useUser()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true) // carga inicial / cambio de sesión
  const [busy, setBusy] = useState(false) // hay una modificación en curso (deshabilita botones)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const mergeRef = useRef(null) // promesa de la fusión en curso (evita duplicarla con StrictMode)

  // ── Carga inicial y reacción a login / logout ─────────────────────────────
  useEffect(() => {
    if (authLoading) return // esperar a saber si hay sesión

    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      try {
        if (!isAuthenticated) {
          setItems(readLocalCart()) // invitado
          return
        }

        // Sesión iniciada: fusionar el carrito de invitado (si lo hay) con el del servidor.
        const guestItems = takeLocalCart()
        if (guestItems.length > 0) mergeRef.current = mergeGuestCart(guestItems)
        if (mergeRef.current) await mergeRef.current

        const { cart } = await cartApi.getCart(controller.signal)
        setItems(fromBackend(cart))
      } catch (error) {
        if (!isCanceled(error))
          toast.error(getErrorMessage(error, 'No se pudo cargar el carrito'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [authLoading, isAuthenticated])

  // ── Datos derivados (se calculan al renderizar; no son estado) ────────────
  const { total, itemsQuantity } = useMemo(
    () => ({
      total: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      itemsQuantity: items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    [items],
  )

  /** runMutation — ejecuta una acción contra el backend y aplica el carrito devuelto. */
  const runMutation = useCallback(async (action, successMessage) => {
    setBusy(true)
    try {
      const response = await action()
      if (response?.cart) setItems(fromBackend(response.cart))
      if (successMessage) toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo actualizar el carrito'))
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  /** commitLocal — actualiza el estado y persiste en localStorage (solo invitados). */
  const commitLocal = useCallback((next) => {
    setItems(next)
    writeLocalCart(next)
  }, [])

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated)
        return runMutation(
          () => cartApi.addCartItem(product._id, quantity),
          'Producto agregado al carrito',
        )

      const existing = items.find((item) => item._id === product._id)
      const newQuantity = (existing?.quantity ?? 0) + quantity
      if (newQuantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`)
        return false
      }
      commitLocal(
        existing
          ? items.map((item) =>
              item._id === product._id
                ? { ...item, quantity: newQuantity }
                : item,
            )
          : [...items, toCartItem(product, quantity)],
      )
      toast.success('Producto agregado al carrito')
      return true
    },
    [isAuthenticated, items, runMutation, commitLocal],
  )

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) return false
      if (isAuthenticated)
        return runMutation(() => cartApi.updateCartItem(productId, quantity))

      const item = items.find((i) => i._id === productId)
      if (item && quantity > item.stock) {
        toast.error(`Solo hay ${item.stock} unidades disponibles`)
        return false
      }
      commitLocal(
        items.map((i) => (i._id === productId ? { ...i, quantity } : i)),
      )
      return true
    },
    [isAuthenticated, items, runMutation, commitLocal],
  )

  const removeItem = useCallback(
    async (productId) => {
      if (isAuthenticated)
        return runMutation(
          () => cartApi.removeCartItem(productId),
          'Producto eliminado del carrito',
        )
      commitLocal(items.filter((i) => i._id !== productId))
      toast.success('Producto eliminado del carrito')
      return true
    },
    [isAuthenticated, items, runMutation, commitLocal],
  )

  /** clearCart({ silent }) — vacía el carrito. Es idempotente (el backend no falla si ya está vacío). */
  const clearCart = useCallback(
    async ({ silent = false } = {}) => {
      if (isAuthenticated)
        return runMutation(
          () => cartApi.clearCartRequest(),
          silent ? null : 'Carrito vacío',
        )
      commitLocal([])
      if (!silent) toast.success('Carrito vacío')
      return true
    },
    [isAuthenticated, runMutation, commitLocal],
  )

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const value = useMemo(
    () => ({
      items,
      total,
      itemsQuantity,
      loading,
      busy,
      isModalOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openModal,
      closeModal,
    }),
    [
      items,
      total,
      itemsQuantity,
      loading,
      busy,
      isModalOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openModal,
      closeModal,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return context
}

/**
 * mergeGuestCart — envía al backend los productos del carrito de invitado, uno a uno.
 * Lo llama : el efecto de carga de CartProvider justo después de iniciar sesión.
 * Nunca lanza: si algún producto falla (p. ej. sin stock) se avisa y se sigue con los demás.
 */
async function mergeGuestCart(guestItems) {
  const failed = []
  for (const item of guestItems) {
    try {
      await cartApi.addCartItem(item._id, item.quantity)
    } catch {
      failed.push(item.name)
    }
  }
  if (failed.length < guestItems.length)
    toast.success('Carrito sincronizado con tu cuenta')
  if (failed.length > 0)
    toast.error(`No se pudieron agregar: ${failed.join(', ')}`)
}
