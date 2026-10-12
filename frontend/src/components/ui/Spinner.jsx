// E-commerce/frontend/src/components/ui/Spinner.jsx

/**
 * ARCHIVO : src/components/ui/Spinner.jsx
 * ROL     : indicador de carga ACCESIBLE (role="status" + texto para lectores de pantalla).
 *           Spinner = en línea.  PageLoader = ocupa la pantalla (rutas protegidas, carga de páginas lazy).
 * LO USA  : ProtectedRoute, Layout (Suspense), Home, DetailProduct, Orders, AdminProducts, UpdateProduct…
 */
export const Spinner = ({ label = 'Cargando…' }) => (
  <span role="status" className="inline-flex flex-col items-center gap-2">
    <span className="loading loading-spinner loading-lg" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
)

export const PageLoader = ({ label }) => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <Spinner label={label} />
  </div>
)
