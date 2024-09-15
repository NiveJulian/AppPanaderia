const validationClienteForm = (formData) => {
  let errors = {};

  // Validación de nombre
  if (formData.nombre && !formData.nombre.trim()) {
    errors.nombre = "El nombre es requerido";
  }

  // Validación de cantidad
  if (formData.direccion && !formData.direccion.trim()) {
    errors.direccion = "La cantidad es requerida";
  }

  if (formData.celular && !formData.celular.trim()) {
    errors.celular = "Necesitamos un celular";
  }
  return errors;
};

export default validationClienteForm;
