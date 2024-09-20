import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import validationClienteForm from "./validationClienteForm";
import {
  createClient,
  updateClient,
} from "../../../redux/actions/clientActions";

export default function TabCreateClient({ isOpen, onClose, cliente, uid }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    celular: "",
  });
  const [errors, setErrors] = useState({});
  const memoizedErrors = useMemo(() => {
    return validationClienteForm(formData);
  }, [formData]);

  useEffect(() => {
    setErrors(memoizedErrors);
  }, [memoizedErrors]);

  useEffect(() => {
    if (cliente) {
      setFormData({
        id: cliente.id || "",
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        celular: cliente.celular || "",
      });
    }
  }, [cliente]);

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
        if (cliente) {
          const updateRow = {
            nombre: formData.nombre,
            direccion: formData.direccion,
            celular: formData.celular,
            uid,
          };

          dispatch(updateClient(cliente.id, updateRow));
        } else {
          const newRow = {
            nombre: formData.nombre,
            direccion: formData.direccion,
            celular: formData.celular,
            uid,
          };
          dispatch(createClient(newRow));
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
          <label htmlFor="direccion">Direccion</label>
          <input
            className={`bg-white w-full p-2 text-center mt-2 rounded-md border ${
              errors.direccion ? "border-red-500" : "border-gray-400"
            }`}
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="direccion"
          />
          {errors.direccion && (
            <p className="text-red-500 text-xs">{errors.direccion}</p>
          )}
        </div>
        <div className="mt-2">
          <label htmlFor="celular">Celular</label>
          <input
            className={`bg-white w-full p-2 text-center mt-2 rounded-md border ${
              errors.celular ? "border-red-500" : "border-gray-400"
            }`}
            type="text"
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="celular"
          />
          {errors.celular && (
            <p className="text-red-500 text-xs">{errors.celular}</p>
          )}
        </div>
        <button
          type="submit"
          className="p-4 shadow-lg bg-blue-300 text-gray-900 rounded-md mt-2"
        >
          Crear cliente
        </button>
      </form>
    </div>
  );
}
