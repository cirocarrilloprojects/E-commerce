// E-commerce/frontend/src/pages/Login.jsx

/**
 * ARCHIVO : src/pages/Login.jsx — página /login. USA: LoginForm, UserContext.
 * Si ya hay sesión redirige al inicio (evita ver el formulario estando logueado).
 */
import { Navigate } from 'react-router'
import LoginForm from '../components/auth/LoginForm'
import { useUser } from '../context/UserContext'

const Login = () => {
  const { isAuthenticated, loading } = useUser()
  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="mt-16">
      <h1 className="text-center text-3xl font-bold">Iniciar sesión</h1>
      <LoginForm />
    </div>
  )
}

export default Login
