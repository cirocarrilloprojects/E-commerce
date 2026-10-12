// E-commerce/frontend/src/hooks/useBackendHealth.jsx
/**
 * ARCHIVO : src/hooks/useBackendHealth.js
 * CAPA    : custom hook + provider (estado de "salud" del backend)
 * ROL     : consultar GET /health periódicamente para saber si el backend (y la BD) está operativo.
 * LO USA  : App.jsx (monta el provider) y BackendStatusBanner (lee el estado).
 *
 * ESTADOS:
 *   'checking'  → aún no hay primera respuesta
 *   'ok'        → 200 { status: 'ok', db: 'connected' }
 *   'degraded'  → 200 { status: 'ok', db: 'disconnected' }  (backend vivo, BD caída)
 *   'down'      → error de red / timeout / 502 / 503 / 504
 *
 * POR QUÉ UN PROVIDER Y NO SOLO UN HOOK:
 *   Si dos componentes llaman a useBackendHealth(), cada uno crearía su propio intervalo. Con un Context
 *   hay UNA sola consulta periódica compartida por toda la app (menos carga, estado consistente).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { http, isCanceled } from '../lib/http'

const BackendHealthContext = createContext(null)

// Cada cuánto revisar el estado del backend (en ms).
const POLL_INTERVAL_MS = 30000
// Timeout corto: si /health tarda más que esto, consideramos que el backend está caído.
const HEALTH_TIMEOUT_MS = 4000

const INITIAL_STATE = {
  status: 'checking',
  db: null,
  lastCheck: null,
  error: null,
}

export const BackendHealthProvider = ({ children }) => {
  const [state, setState] = useState(INITIAL_STATE)

  // Un solo AbortController "global" para poder cancelar en cleanup sin dejar timers huérfanos.
  const abortRef = useRef(null)
  const intervalRef = useRef(null)

  const check = useCallback(async () => {
    // Cancela la petición anterior si aún estaba en vuelo (evita carreras si el usuario pulsa "Reintentar").
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await http.get('/health', {
        signal: controller.signal,
        timeout: HEALTH_TIMEOUT_MS,
      })
      const db = response.data?.db ?? null
      setState({
        status: db === 'connected' ? 'ok' : 'degraded',
        db,
        lastCheck: new Date(),
        error: null,
      })
    } catch (error) {
      if (isCanceled(error)) return
      setState({
        status: 'down',
        db: null,
        lastCheck: new Date(),
        error,
      })
    }
  }, [])

  useEffect(() => {
    check() // primera comprobación inmediata al montar
    intervalRef.current = setInterval(check, POLL_INTERVAL_MS)

    return () => {
      clearInterval(intervalRef.current)
      abortRef.current?.abort()
    }
  }, [check])

  return (
    <BackendHealthContext.Provider value={{ ...state, refetch: check }}>
      {children}
    </BackendHealthContext.Provider>
  )
}

export const useBackendHealth = () => {
  const context = useContext(BackendHealthContext)
  if (!context)
    throw new Error(
      'useBackendHealth debe usarse dentro de <BackendHealthProvider>',
    )
  return context
}
