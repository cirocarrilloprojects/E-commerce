// E-commerce/frontend/src/pages/NotFound.jsx

/**
 * ARCHIVO : src/pages/NotFound.jsx — ruta comodín "*" (antes cualquier URL desconocida mostraba una página en blanco).
 */
import { Link } from 'react-router'

const NotFound = () => (
  <div className="mt-20 text-center">
    <h1 className="mb-2 text-4xl font-bold">404</h1>
    <p className="mb-6">La página que buscas no existe.</p>
    <Link to="/" className="btn btn-primary">
      Volver al inicio
    </Link>
  </div>
)

export default NotFound
