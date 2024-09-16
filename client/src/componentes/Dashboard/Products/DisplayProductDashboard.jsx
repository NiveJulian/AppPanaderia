import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createSaleDashboard } from "../../../redux/actions/salesActions";
import {
  addToCart,
  cleanCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../../../redux/actions/cartActions";
import Loader from "../../Loader/Loader";

const DisplayProductDashboard = ({ products, client }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const calculateTotal = () => {
    const total = cartItems.reduce((acc, product) => {
      const precio = parseInt(product.precio);
      const quantity = product.cantidad || 1;
      return acc + (isNaN(precio) ? 0 : precio * quantity);
    }, 0);
    let totalFinal = total;

    return totalFinal.toFixed(2);
  };

  const handleCreateVenta = () => {
    // Validaciones
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    // Activar el loader
    setLoading(true);

    // Crear el objeto de venta
    const venta = {
      productos: cartItems.map((prod) => ({
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        cantidad: prod.cantidad,
      })),
      idCliente: id,
      total: calculateTotal(),
    };
    dispatch(createSaleDashboard(venta))
      .then(() => {
        // Mostrar mensaje de éxito
        toast.success("Venta creada exitosamente...");

        // Limpiar el carrito
        dispatch(cleanCart());
      })
      .catch((error) => {
        // Mostrar mensaje de error si algo falla
        toast.error("Hubo un error al crear la venta.");
      })
      .finally(() => {
        // Desactivar el loader cuando termine
        setLoading(false);
      });
  };

  const handleAddToCart = (product) => {
    const available = product.stock;

    const existingCartItem = cartItems.find((item) => item.id === product.id);

    if (existingCartItem) {
      if (existingCartItem.cantidad < available) {
        dispatch(incrementQuantity(product.id));
        toast.success("Cantidad actualizada en el carrito");
      } else {
        toast.error("No hay suficiente stock disponible");
      }
    } else {
      if (available > 0) {
        const data = {
          id: product.id,
          nombre: product.nombre,
          cantidad: 1,
          precio: product.precio,
        };
        dispatch(addToCart(data));
        toast.success("Se agregó al carrito");
      } else {
        toast.error("Producto sin stock");
      }
    }
  };

  const handleQuantityChange = (index, action) => {
    const item = cartItems[index];
    const product = products.find((p) => p.id === item.id);

    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    const availableStock = product.stock;

    if (action === "increase") {
      if (item.cantidad < availableStock) {
        dispatch(incrementQuantity(item.id));
      } else {
        toast.error("No hay suficiente stock disponible");
      }
    } else if (action === "decrease") {
      dispatch(decrementQuantity(item.id));
    }
  };

  const handleRemoveFromCart = (index) => {
    const productId = cartItems[index].id;
    dispatch(removeFromCart(productId));
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const lowerCaseSearchTerm = searchTerm?.toLowerCase();
    return product?.nombre?.toLowerCase().includes(lowerCaseSearchTerm);
  });

  return (
    <div className="container mx-auto bg-white border border-gray-300 shadow-lg">
      {loading ? (
        <div className="flex justify-center flex-col gap-2 items-center h-screen">
          <Loader />
          <h1 className="text-3xl text-secondary">Creando venta...</h1>
        </div>
      ) : (
        <div className="flex lg:flex-row flex-col shadow-lg">
          {/* Productos */}
          <div className="lg:w-2/3 h-screen overflow-y-scroll shadow-lg">
            <div className="flex flex-row justify-between items-center px-4 mt-5">
              <div className="text-gray-800">
                <div className="font-bold font-serif text-xl flex gap-2 justify-center items-center">
                  <span className="w-12 h-12 rounded-full bg-yellow-600"></span>
                  Entrega a <span className="uppercase p-1 border border-gray-300 rounded-md text-white bg-yellow-600">{client?.nombre}</span>
                </div>
                <span className="text-xs">Location ID#PDL009</span>
              </div>
              <div className="flex items-center">
                <div className="text-sm text-center mr-4">
                  <div className="font-light text-gray-500"></div>
                  <span className="font-semibold"></span>
                </div>
              </div>
            </div>
            <div className="mt-5 px-5">
              <input
                type="text"
                placeholder="Buscar por nombre o SKU"
                value={searchTerm}
                onChange={handleSearchTermChange}
                className="border p-2 rounded-md w-full border-gray-400"
              />
            </div>
            <div className="grid grid-cols-3 px-3 py-3 gap-4 mt-5 overflow-y-auto h-auto">
              {filteredProducts &&
                filteredProducts.map((product, i) => {
                  return (
                    <button
                      key={i}
                      onClick={() => handleAddToCart(product)}
                      className="flex h-32 border cursor-pointer shadow-md rounded-md p-2 flex-col items-center justify-center w-full mx-auto hover:shadow-xl active:shadow-lg active:translate-y-[2px]"
                    >
                      <h4 className="mt-2 text-sm font-medium text-primary">
                        {product.nombre}
                      </h4>
                      <p className="text-tertiary mt-2 text-sm">
                        ${product.precio}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
          {/* Carrito */}
          <div className="lg:w-2/5 h-screen">
            <div className="flex flex-row items-center justify-between px-5 mt-5">
              <div className="font-bold text-xl">Orden Actual</div>
              <div className="font-semibold flex gap-2">
                <span
                  onClick={() => dispatch(cleanCart())}
                  className="px-4 py-2 hover:text-beige rounded-md bg-secondary text-white cursor-pointer"
                >
                  Borrar todo
                </span>
                {/* <span className="px-4 py-2 rounded-md bg-gray-100 text-gray-800">
                Setting
              </span> */}
              </div>
            </div>
            <div className="px-5 py-4 mt-5 overflow-y-auto h-64">
              {cartItems?.length > 0
                ? cartItems?.map((item, i) => {
                    const product = products?.find((p) => p.id === item.id);
                    const availableStock = product ? product.stock : 0;
                    return (
                      <div
                        key={i}
                        className="flex flex-row justify-between items-center mb-4"
                      >
                        <div className="flex flex-row items-center w-2/5">
                          <span className="ml-4 font-semibold text-sm text-primary text-center">
                            {item?.nombre}
                          </span>
                        </div>
                        <div className="w-24 flex justify-between items-center">
                          <button
                            onClick={() => handleQuantityChange(i, "decrease")}
                            className="px-3 py-1 rounded-md bg-gray-300"
                            disabled={item.cantidad <= 1} // Opcional: Deshabilitar si cantidad es 1
                          >
                            -
                          </button>
                          <span className="font-semibold mx-4">
                            {item?.cantidad || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(i, "increase")}
                            className={`px-3 py-1 rounded-md bg-gray-300 ${
                              item.cantidad >= availableStock
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                            disabled={item.cantidad >= availableStock}
                          >
                            +
                          </button>
                        </div>
                        <div className="w-1/5 flex flex-col justify-between items-center">
                          <span className="font-semibold text-primary text-center">
                            ${parseInt(item.precio) * item.cantidad || 1}
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(i)}
                            className="mt-2 font-semibold text-xs text-red-500 hover:text-beige"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
            {/* Formulario */}
            <div className="px-5"></div>
            <div className="flex flex-row justify-between items-center px-5 mt-10">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold text-primary">
                  ${calculateTotal()}
                </div>
              </div>
              <button
                onClick={handleCreateVenta}
                className="px-5 py-2 bg-secondary text-white rounded-md"
              >
                Crear Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayProductDashboard;
