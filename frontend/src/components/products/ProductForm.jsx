//E-commerce/frontend/src/components/products/ProductForm.jsx
/**
 * ARCHIVO : src/components/products/ProductForm.jsx
 * CAPA    : componente de formulario COMPARTIDO (reemplaza a CreateProductForm y UpdateProductForm, ~150 líneas duplicadas)
 * ROL     : formulario de producto para crear y editar.
 * LO USA  : pages/admin/CreateProduct.jsx (sin defaultValues) y pages/admin/UpdateProduct.jsx (con el producto cargado).
 * RECIBE  : defaultValues, onSubmit(valores) (puede lanzar: aquí se captura y se muestra el mensaje del backend),
 *           submitLabel.
 * GENERA  : valores con los tipos correctos: price y stock como NÚMEROS (valueAsNumber), porque el backend valida con
 *           Zod z.number() y rechaza strings ("7000").
 *
 * ERRORES CORREGIDOS: la descripción pedía "mínimo 3" pero el mensaje decía "10" (el backend exige 10); el precio exigía
 * "mínimo 2" con el mensaje "mayor a 1"; autoComplete con valores inválidos ("price", "stock"…); sin <label>;
 * y en la edición el formulario aparecía vacío porque defaultValues se leía antes de que llegara el producto.
 */
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../lib/http'
import { imageUrlRules, numberRules, textRules } from '../../lib/validation'
import TextField from '../ui/TextField'

const ProductForm = ({ defaultValues, onSubmit, submitLabel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues })

  const submit = async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo guardar el producto'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mx-auto mt-8 flex max-w-125 flex-col gap-4 lg:gap-6"
      noValidate
    >
      <TextField
        id="name"
        label="Nombre"
        error={errors.name}
        {...register('name', textRules('El nombre', { min: 3, max: 50 }))}
      />
      <TextField
        id="description"
        label="Descripción"
        error={errors.description}
        {...register(
          'description',
          textRules('La descripción', { min: 10, max: 500 }),
        )}
      />
      <TextField
        id="price"
        label="Precio"
        type="number"
        step="any"
        inputMode="decimal"
        error={errors.price}
        {...register('price', numberRules('El precio', { min: 0.01 }))}
      />
      <TextField
        id="stock"
        label="Stock"
        type="number"
        inputMode="numeric"
        error={errors.stock}
        {...register(
          'stock',
          numberRules('El stock', { min: 0, integer: true }),
        )}
      />
      <TextField
        id="imageUrl"
        label="URL de la imagen"
        type="url"
        error={errors.imageUrl}
        {...register('imageUrl', imageUrlRules)}
      />
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}

export default ProductForm
