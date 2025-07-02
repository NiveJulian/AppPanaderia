import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import validationProductForm from "./validationClienteForm";
import toast from "react-hot-toast";
import {
  addSheetRow,
  createProductByClientId,
  updateRow,
} from "../../../redux/actions/productActions";
import { getClientByUserID } from "../../../redux/actions/clientActions";
import PropTypes from "prop-types";

export default function TabFormCreateProduct({ isOpen, onClose, product, onProductCreated }) {
  const dispatch = useDispatch();
  const { clientes } = useSelector((state) => state.client);
  const user = useSelector((state) => state.auth.user);


  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    precio: 0,
    clientId: "",
  });
  const [errors, setErrors] = useState({});
  const memoizedErrors = useMemo(() => {
    return validationProductForm(formData);
  }, [formData]);

  useEffect(() => {
    setErrors(memoizedErrors);
  }, [memoizedErrors]);

  useEffect(() => {
    if (isOpen && user && user.uid) {
      dispatch(getClientByUserID(user.uid));
    }
  }, [isOpen, dispatch, user]);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || "",
        nombre: product.nombre || "",
        cantidad: product.stock || "",
        precio: product.precio || "",
        clientId: product.clientId || "",
      });
    } else {
      setFormData({
        nombre: "",
        cantidad: "",
        precio: 0,
        clientId: "",
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
          cantidad: formData.cantidad,
          precio: formData.precio,
        };

        if (product && product.id) {
          const updatedRows = {
            id: formData.id,
            nombre: formData.nombre,
            cantidad: formData.cantidad,
            precio: formData.precio,
            clientId: formData.clientId || null,
          };
          dispatch(updateRow(updatedRows)).then(() => {
            if (onProductCreated) onProductCreated();
          });
        } else if (formData.clientId && formData.clientId !== "") {
          dispatch(createProductByClientId(formData.clientId, newRow)).then(() => {
            if (onProductCreated) onProductCreated();
          });
        } else {
          dispatch(addSheetRow(newRow));
        }

        setFormData({
          nombre: "",
          cantidad: "",
          precio: 0,
          clientId: "",
        });
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
          <label htmlFor="clientId">Cliente asignado</label>
          <select
            className={`bg-white w-full p-2 text-center mt-2 rounded-md border ${
              errors.clientId ? "border-red-500" : "border-gray-400"
            }`}
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
          >
            <option value="">Producto global (visible para todos los clientes)</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Si seleccionas un cliente, solo ese cliente podrá ver y vender este producto.<br/>
            Si dejas la opción global, todos los clientes podrán verlo y venderlo.
          </p>
          {errors.clientId && (
            <p className="text-red-500 text-xs">{errors.clientId}</p>
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

TabFormCreateProduct.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onProductCreated: PropTypes.func,
};
