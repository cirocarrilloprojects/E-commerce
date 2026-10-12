// E-commerce/frontend/src/components/auth/RegisterForm.jsx
/**
 * ARCHIVO : src/components/auth/RegisterForm.jsx
 * ROL     : formulario de registro.
 * LO USA  : pages/Register.jsx.   USA: UserContext.register, TextField, PasswordField, lib/validation.
 *
 * ERRORES CORREGIDOS:
 *  - onSubmit no tenía try/catch: si el servicio lanzaba (email repetido, 429…) la promesa fallaba en silencio y el
 *    toast de error NUNCA se mostraba (se comprobaba result.message, que solo existía en el caso de éxito).
 *  - Rama vacía "if (redirect && userInfo.isAdmin) { // llevamos… }" (código muerto): el flujo cae al mismo destino.
 *  - Clase inexistente "focus:outliner-primary" (typo) y duplicación del bloque de contraseña con Login.
 *  - Política de contraseña alineada con el backend v2: 8–72 caracteres (antes 6–254).
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useUser } from '../../context/UserContext'
import { getErrorMessage } from '../../lib/http'
import {
  emailRules,
  newPasswordRules,
  usernameRules,
} from '../../lib/validation'
import PasswordField from '../ui/PasswordField'
import TextField from '../ui/TextField'

const RegisterForm = () => {
  const { register: registerUser } = useUser()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Registro exitoso')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'No se pudo completar el registro, intenta más tarde',
        ),
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-8 flex max-w-125 flex-col gap-4 lg:gap-6"
      noValidate
    >
      <TextField
        id="username"
        label="Nombre de usuario"
        autoComplete="username"
        error={errors.username}
        {...register('username', usernameRules)}
      />
      <TextField
        id="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email}
        {...register('email', emailRules)}
      />
      <PasswordField
        id="password"
        label="Contraseña (mínimo 8 caracteres)"
        autoComplete="new-password"
        error={errors.password}
        {...register('password', newPasswordRules)}
      />
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registrando…' : 'Registrarse'}
      </button>
    </form>
  )
}

export default RegisterForm
