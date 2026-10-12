// E-commerce/frontend/src/components/ui/Pagination.jsx
/**
 * ARCHIVO : src/components/ui/Pagination.jsx
 * ROL     : paginación anterior/siguiente basada en el total que devuelve el backend (cabecera X-Total-Count).
 * LO USA  : pages/Home, pages/admin/AdminProducts.   RECIBE: page, total, limit, onChange(nuevaPagina).
 */
const Pagination = ({ page, total, limit, onChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Paginación"
      className="mt-8 flex items-center justify-center gap-4"
    >
      <button
        className="btn btn-outline btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </button>
      <span className="text-sm" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <button
        className="btn btn-outline btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}

export default Pagination
