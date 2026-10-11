// E-commerce/frontend/src/components/Login/LoginForm.jsx

import { useState } from 'react'
import { Navigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginService } from '../../services/authServices'
import { useUser } from '../../context/UserContext'
import toast from 'react-hot-toast'

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange', // validacion en tiempo real
  })

  // ojito de estado de la contraseña

  const { setUserInfo, userInfo } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [redirect, setRedirect] = useState(false)

  const onSubmit = async (data) => {
    // login de usuario
    const result = await loginService(data, reset, setUserInfo, setRedirect)

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  if (redirect && userInfo.isAdmin) {
    //return <Navigate to={"/admin/dashboard"} />
  }

  if (redirect && !userInfo.isAdmin) {
    return <Navigate to="/" />
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 flex flex-col gap-4 lg:gap-6 max-w-125 mx-auto"
    >
      <div>
        <input
          className={`p-2 outline-2 rounded border focus:outliner-primary w-full ${errors.email ? 'border-red-500 outline-red-500 focus:outline-red-500' : ''}`}
          placeholder="Correo electrónico"
          type="email"
          autoComplete="email"
          name="email"
          {...register('email', {
            required: 'El correo electrónico es obligatorio',
            pattern: {
              value:
                /^(?!\.)(?!.*\.\.)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
              message: 'Por favor, ingrese un correo electrónico válido',
            },
            minLength: {
              value: 6,
              message: 'El correo electrónico debe tener al menos 6 caracteres',
            },
            maxLength: {
              value: 75,
              message:
                'El correo electrónico no puede tener más de 75 caracteres',
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-2 ml-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="relative">
        <input
          autoComplete="current-password"
          className={`p-2 outline-2 rounded border focus:outline-primary w-full ${errors.password ? 'border-red-500 outline-red-500 focus:outline-red-500' : ''}`}
          name="password"
          placeholder="Contraseña"
          type={showPassword ? 'text' : 'password'}
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: {
              value: 6,
              message: 'La contraseña debe tener al menos 6 caracteres',
            },
            maxLength: {
              value: 250,
              message: 'La contraseña no puede tener más de 250 caracteres',
            },
          })}
        />
        <button
          className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          type="button"
          aria-label={
            showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
          }
          onClick={() =>
            setShowPassword((prevShowPassword) => !prevShowPassword)
          }
        >
          {showPassword ? <FaEyeSlash size={23} /> : <FaEye size={23} />}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-sm mt-2 ml-1">
          {errors.password.message}
        </p>
      )}

      <button className="btn btn-primary" type="submit">
        Iniciar sesión
      </button>
    </form>
  )
}
export default LoginForm
