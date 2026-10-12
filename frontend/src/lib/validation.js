// E-commerce/frontend/src/lib/validation.js
/**
 * ARCHIVO : src/lib/validation.js
 * CAPA    : validación de formularios (reglas de react-hook-form compartidas)
 * ROL     : definir UNA vez las reglas que antes se copiaban en cada formulario. Están alineadas con los
 *           esquemas Zod del backend v2 (schema/*.js): si el backend cambia, se cambia aquí.
 * LO USA  : LoginForm, RegisterForm, ProductForm, Checkout.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** textRules — campo de texto obligatorio con longitud mínima/máxima. */
export const textRules = (label, { min = 1, max = 100 } = {}) => ({
  required: `${label} es obligatorio`,
  minLength: { value: min, message: `Mínimo ${min} caracteres` },
  maxLength: { value: max, message: `Máximo ${max} caracteres` },
  setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
})

export const emailRules = {
  required: 'El correo electrónico es obligatorio',
  pattern: {
    value: EMAIL_REGEX,
    message: 'Ingresa un correo electrónico válido',
  },
  maxLength: { value: 254, message: 'Máximo 254 caracteres' },
}

export const usernameRules = textRules('El nombre de usuario', {
  min: 3,
  max: 20,
})

// Registro: 8–72 caracteres (bcrypt solo usa los primeros 72 bytes).
export const newPasswordRules = {
  required: 'La contraseña es obligatoria',
  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
  maxLength: { value: 72, message: 'Máximo 72 caracteres' },
}

// Login: solo se exige que exista (no se re-valida la política de contraseñas).
export const currentPasswordRules = { required: 'La contraseña es obligatoria' }

export const phoneRules = {
  required: 'El teléfono es obligatorio',
  pattern: {
    value: /^[0-9+\-\s()]+$/,
    message: 'Formato de teléfono inválido',
  },
  minLength: { value: 7, message: 'Mínimo 7 dígitos' },
  maxLength: { value: 20, message: 'Máximo 20 caracteres' },
}

/** numberRules — campo numérico. valueAsNumber hace que RHF entregue un NÚMERO (el backend rechaza strings). */
export const numberRules = (label, { min, integer = false } = {}) => ({
  valueAsNumber: true,
  required: `${label} es obligatorio`,
  validate: (v) => {
    if (!Number.isFinite(v)) return `${label} debe ser un número`
    if (integer && !Number.isInteger(v))
      return `${label} debe ser un número entero`
    if (min !== undefined && v < min)
      return `${label} no puede ser menor que ${min}`
    return true
  },
})

export const imageUrlRules = {
  required: 'La URL de la imagen es obligatoria',
  validate: (v) => {
    try {
      const { protocol } = new URL(v)
      return (
        protocol === 'http:' ||
        protocol === 'https:' ||
        'La URL debe empezar por http:// o https://'
      )
    } catch {
      return 'Ingresa una URL válida'
    }
  },
}
