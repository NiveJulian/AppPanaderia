const validationProductForm = (formData) => {
  let errors = {};

  // Validación de nombre
  if (formData.nombre && !formData.nombre.trim()) {
    errors.nombre = "El nombre es requerido";
  }

  // Validación de cantidad
  if (formData.stock && !formData.stock.trim()) {
    errors.stock = "La cantidad es requerida";
  }

  // Asegúrate de que formData.precio sea una cadena
  const precioString = formData.precio ? formData.precio.toString() : "";
  const sanitizedPrice = precioString.replace(/,/g, "");

  if (formData.precio && !sanitizedPrice) {
    errors.precio = "El precio es requerido";
  } else if (formData.precio && !sanitizedPrice.trim()) {
    errors.precio = "El precio no puede ser solo espacios";
  } else if (formData.precio && !/^\d+(\.\d{1,2})?$/.test(sanitizedPrice)) {
    errors.precio =
      "El precio debe ser un número positivo con hasta dos decimales";
  } else if (parseFloat(sanitizedPrice) <= 0) {
    errors.precio = "El precio debe ser mayor a 0";
  }

  return errors;
};

export default validationProductForm;
