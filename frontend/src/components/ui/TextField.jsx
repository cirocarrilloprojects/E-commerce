// E-commerce/frontend/src/components/ui/TextField.jsx
/**
 * ARCHIVO : src/components/ui/TextField.jsx
 * CAPA    : componente presentacional reutilizable
 * ROL     : campo de formulario ACCESIBLE: <label> real, aria-invalid, aria-describedby y mensaje de error con role="alert".
 *           Reemplaza los ~20 bloques <input> + <p> copiados y pegados en cada formulario.
 * LO USA  : LoginForm, RegisterForm, PasswordField, ProductForm, Checkout.
 * RECIBE  : id, label, error (objeto de react-hook-form), endAdornment (elemento dentro del input) y el resto de
 *           props del <input>. Con react-hook-form:  <TextField id="email" label="Correo" error={errors.email} {...register('email', rules)} />
 *           (React 19 pasa `ref` como una prop más, por eso el spread de register() funciona sin forwardRef).
 */
const TextField = ({
  id,
  label,
  error,
  endAdornment,
  className = '',
  ...inputProps
}) => {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`input w-full ${error ? 'input-error' : ''} ${endAdornment ? 'pr-12' : ''} ${className}`}
          {...inputProps}
        />
        {endAdornment}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 ml-1 text-sm text-error">
          {error.message}
        </p>
      )}
    </div>
  )
}

export default TextField
