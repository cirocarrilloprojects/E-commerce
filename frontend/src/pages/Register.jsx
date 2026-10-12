// E-commerce/frontend/src/pages/Register.jsx
/**
 * ARCHIVO : src/pages/Register.jsx — página /register. USA: RegisterForm, UserContext.
 */
import { Navigate } from 'react-router'
import RegisterForm from '../components/auth/RegisterForm'
import { useUser } from '../context/UserContext'

const Register = () => {
  const { isAuthenticated, loading } = useUser()
  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="mt-16">
      <h1 className="text-center text-3xl font-bold">Registrarse</h1>
      <RegisterForm />
    </div>
  )
}

export default Register
