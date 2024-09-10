import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import validationProductForm from "./validationProductForm";
import toast from "react-hot-toast";
import {
  addSheetRow,
  updateRow,
} from "../../../redux/actions/productActions";

export default function TabFormCreateProduct({ isOpen, onClose, product }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    precio: 0,
  });
  const [errors, setErrors] = useState({});
  const memoizedErrors = useMemo(() => {
    return validationProductForm(formData);
  }, [formData]);

  useEffect(() => {
    setErrors(memoizedErrors);
  }, [memoizedErrors]);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || "",
        nombre: product.nombre || "",
        cantidad: product.stock || "",
        precio: product.precio || "",
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(memoizedErrors).length === 0) {
      try {
        const newRow = {
          nombre: formData.nombre,
          stock: formData.cantidad,
          precio: formData.precio,
        };

        if (product) {
          const updatedRows = {
            id: formData.id,
            nombre: formData.nombre,
            stock: formData.cantidad,
            precio: formData.precio,
          };

          dispatch(updateRow(updatedRows));
        } else {
          dispatch(addSheetRow(newRow));
        }
        setFormData({});
        onClose();
      } catch (error) {
        toast.error("Error al crear el nuevo producto");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <form
        className="bg-white h-auto text-center shadow-md p-6 rounded-xl md:w-1/2 lg:w-auto m-2 flex flex-col"
        onSubmit={handleSubmit}
      >
        <button
          onClick={onClose}
          className="text-gray-400 flex text-3xl hover:text-gray-500"
        >
          &times;
        </button>
        <div className="mt-2">
          <label htmlFor="nombre">Nombre</label>
          <input
            className={`bg-white w-full p-2 text-center mt-2 rounded-md border ${
              errors.nombre ? "border-red-500" : "border-gray-400"
            }`}
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs">{errors.nombre}</p>
          )}
        </div>
        <div className="mt-2">
          <label htmlFor="cantidad">Cantidad</label>
          <input
            className={`bg-white w-full p-2 text-center mt-2 rounded-md border ${
              errors.stock ? "border-red-500" : "border-gray-400"
            }`}
            type="text"
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            placeholder="Cantidad"
          />
          {errors.stock && (
            <p className="text-red-500 text-xs">{errors.stock}</p>
          )}
        </div>
        <div className="mt-2">
          <label htmlFor="precio">Precio</label>
          <input
            className={`bg-white w-full p-2 text-center mt-2 rounded-md border ${
              errors.precio ? "border-red-500" : "border-gray-400"
            }`}
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            placeholder="Precio"
          />
          {errors.precio && (
            <p className="text-red-500 text-xs">{errors.precio}</p>
          )}
        </div>

        <button
          type="submit"
          className="p-4 shadow-lg bg-blue-300 text-gray-900 rounded-md mt-2"
        >
          {product ? "Editar producto" : "Crear producto"}
        </button>
      </form>
    </div>
  );
}
