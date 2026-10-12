// E-commerce/frontend/src/components/auth/LoginForm.jsx
/**
 * ARCHIVO : src/components/auth/LoginForm.jsx
 * ROL     : formulario de inicio de sesión.
 * LO USA  : pages/Login.jsx.   USA: UserContext.login, TextField, PasswordField, lib/validation.
 *
 * MEJORAS vs. versión anterior:
 *  - El servicio ya no recibe setters de React; el formulario llama login() y navega con useNavigate.
 *  - Los errores del backend (401 credenciales, 429 demasiados intentos) se muestran con su mensaje real.
 *  - Después de entrar vuelve a la página que se intentó visitar (location.state.from, lo pone ProtectedRoute).
 *  - El correo permite hasta 254 caracteres (antes 75, menos que el registro: algunos usuarios no podían entrar).
 */
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useUser } from '../../context/UserContext'
import { getErrorMessage } from '../../lib/http'
import { currentPasswordRules, emailRules } from '../../lib/validation'
import PasswordField from '../ui/PasswordField'
import TextField from '../ui/TextField'

const LoginForm = () => {
  const { login } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  const onSubmit = async (data) => {
    try {
      await login(data)
      toast.success('Inicio de sesión exitoso')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al iniciar sesión'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-8 flex max-w-125 flex-col gap-4 lg:gap-6"
      noValidate
    >
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
        label="Contraseña"
        autoComplete="current-password"
        error={errors.password}
        {...register('password', currentPasswordRules)}
      />
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

export default LoginForm
