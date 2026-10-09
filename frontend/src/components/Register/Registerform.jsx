// E-commerce/frontend/src/components/Register/Registerform.jsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Registerform = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange', // validacion en tiempo real
  })

  // ojito de estado de la contraseña

  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = (data) => {
    console.log(data) // reinicia el formulario despues del registro de usuario
    reset() // reinicia el formulario despues del registro de usuario
    // registro de usuario
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 flex flex-col gap-4 lg:gap-6 max-w-125 mx-auto"
    >
      <div>
        <input
          className={`p-2 outline-2 rounded border focus:outliner-primary w-full ${errors.username ? 'border-red-500 outline-red-500 focus:outline-red-500' : ''}`}
          autoComplete="username"
          name="username"
          placeholder="Nombre de usuario"
          type="text"
          {...register('username', {
            required: 'El nombre de usuario es obligatorio',
            minLength: {
              value: 3,
              message: 'El nombre de usuario debe tener al menos 3 caracteres',
            },
            maxLength: {
              value: 20,
              message:
                'El nombre de usuario no puede tener más de 20 caracteres',
            },
          })}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-2 ml-1">
            {errors.username.message}
          </p>
        )}
      </div>
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
          autoComplete="new-password"
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
        Registrarse
      </button>
    </form>
  )
}
export default Registerform
