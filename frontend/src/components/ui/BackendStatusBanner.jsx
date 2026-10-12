// E-commerce/frontend/src/components/ui/BackendStatusBanner.jsx
/**
 * ARCHIVO : src/components/ui/BackendStatusBanner.jsx
 * ROL     : banner que avisa al usuario cuando el backend está caído o la BD desconectada.
 * LO USA  : Layout.jsx.   USA: useBackendHealth.
 *
 * COMPORTAMIENTO:
 *  - No se muestra si status === 'ok' o 'checking' (evita parpadeo al cargar la app).
 *  - Amarillo si 'degraded' (backend vivo, BD caída) — algunas funciones fallarán.
 *  - Rojo si 'down' (backend inalcanzable) — nada funcionará.
 *  - Botón "Reintentar" para forzar una comprobación inmediata.
 */
import { FaExclamationTriangle, FaRedo, FaServer } from 'react-icons/fa'
import { useBackendHealth } from '../../hooks/useBackendHealth'

const BackendStatusBanner = () => {
  const { status, db, error, refetch } = useBackendHealth()

  // Silencioso mientras todo va bien (o mientras se hace la primera comprobación).
  if (status === 'ok' || status === 'checking') return null

  const isDown = status === 'down'
  const Icon = isDown ? FaServer : FaExclamationTriangle

  const message = isDown
    ? 'No hay conexión con el servidor. Revisa que el backend esté encendido.'
    : 'La base de datos no responde. Algunas operaciones pueden fallar.'

  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-center gap-3 rounded-box px-4 py-2 text-sm font-medium ${
        isDown
          ? 'bg-error text-error-content'
          : 'bg-warning text-warning-content'
      }`}
    >
      <Icon aria-hidden="true" />
      <span>{message}</span>
      {isDown && error?.message && (
        <span className="opacity-80">({error.message})</span>
      )}
      {db === 'disconnected' && (
        <span className="opacity-80">(BD desconectada)</span>
      )}
      <button
        type="button"
        onClick={refetch}
        className="btn btn-ghost btn-xs gap-1"
        aria-label="Reintentar conexión con el servidor"
      >
        <FaRedo size={12} aria-hidden="true" />
        Reintentar
      </button>
    </div>
  )
}

export default BackendStatusBanner
