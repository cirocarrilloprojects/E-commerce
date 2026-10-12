// E-commerce/frontend/src/hooks/useFetch.js
/**
 * ARCHIVO : src/hooks/useFetch.js
 * CAPA    : custom hook genérico (estado de servidor sin librerías)
 * ROL     : ejecutar una petición al montar / cuando cambian las dependencias y exponer { data, error, loading, refetch }.
 * LO USA  : hooks/useProducts.js, pages/Orders.jsx.
 *
 * QUÉ RESUELVE (problemas del código anterior):
 *  - Cancela la petición anterior (AbortController) cuando cambian las dependencias o el componente se desmonta:
 *    evita que una respuesta lenta pise a una más reciente (race condition) y avisos de "setState on unmounted".
 *  - Reinicia `data` al cambiar de dependencias: antes DetailProduct mostraba brevemente el producto ANTERIOR.
 *  - Cada pantalla tiene su propio estado (antes todo vivía en un Context global compartido).
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher  función que recibe el signal y devuelve la promesa.
 * @param {any[]} deps  cuándo volver a pedir los datos (como en useEffect). El `fetcher` NO va aquí a propósito:
 *                      se redefine en cada render.
 */
import { useCallback, useEffect, useState } from 'react'
import { isCanceled } from '../lib/http'

export const useFetch = (fetcher, deps = []) => {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ data: null, error: null, loading: true })

    fetcher(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (isCanceled(error)) return // fue cancelada por el cleanup: no es un error
        setState({ data: null, error, loading: false })
      })

    return () => controller.abort() // limpieza: cancela la petición en curso
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])
  return { ...state, refetch }
}
