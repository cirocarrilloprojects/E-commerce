// E-commerce/frontend/src/components/ui/PasswordField.jsx
/**
 * ARCHIVO : src/components/ui/PasswordField.jsx
 * ROL     : TextField de contraseña con botón "mostrar/ocultar" (antes duplicado en Login y Registro).
 * LO USA  : LoginForm, RegisterForm.   USA: TextField.
 */
import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import TextField from './TextField'

const PasswordField = (props) => {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-600"
        >
          {visible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      }
    />
  )
}

export default PasswordField
