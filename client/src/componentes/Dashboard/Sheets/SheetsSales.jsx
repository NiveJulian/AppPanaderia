import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";
import InfiniteScroll from "../InfiniteScroll/InfiniteScroll";

const SheetsSales = ({ data, onViewSale, toggleDelete, changeState }) => {
  const [visibleProducts, setVisibleProducts] = useState(10);
  const currentProducts = data.slice(0, visibleProducts);

  useEffect(() => {
    setVisibleProducts(10);
  }, [data]);

  const handleLoadMore = () => {
    setVisibleProducts((prevVisible) => prevVisible + 10);
  };

  const handleSendMessage = (venta) => {
    const productos = venta.products
      ?.map(
        (producto) => `
          - *Producto*: ${producto.product.nombre}
          - *Precio Unitario*: $${producto.product.precio} 
          - *Subtotal*: $${producto.total}
          - *Cantidad*: ${producto.quantity}\n
          `
      )
      .join("\n") || "";

    const mensaje = `*Ticket de Venta*\n\nCliente: ${venta.client?.nombre || venta.cliente}\nNúmero de Contacto: ${venta.client?.celular || venta.celular}\n\n${productos}\n\nTotal de la compra: $${venta.total}`;

    const numeroWhatsapp = venta.client?.celular || venta.celular;
    const enlace = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(enlace, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completada":
      case "Confirmada":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Anulado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                ID Venta
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Cantidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.length > 0 ? (
              currentProducts.map((venta, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    #{venta.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    <div>
                      <div className="font-medium">{venta.client?.nombre || venta.cliente}</div>
                      <div className="text-gray-500 text-xs">
                        {venta.client?.celular || venta.celular}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {venta.products ? (
                      <div className="max-w-xs">
                        {venta.products.map((product, idx) => (
                          <div key={idx} className="text-xs mb-1">
                            {product.product?.nombre || product.nombre}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {venta.products ? (
                      <div>
                        {venta.products.map((product, idx) => (
                          <div key={idx} className="text-xs mb-1">
                            {product.quantity}
                          </div>
                        ))}
                      </div>
                    ) : (
                      venta.cantidad
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-b">
                    ${venta.total}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm border-b">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(venta.estadoPago)}`}>
                      {venta.estadoPago}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {venta.fecha}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {venta.hora || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium border-b">
                    <div className="flex space-x-2">
                      {(venta.client?.celular || venta.celular) && (
                        <button
                          onClick={() => handleSendMessage(venta)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Enviar WhatsApp"
                        >
                          <FaWhatsapp size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => changeState(venta.id, venta.estadoPago)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Cambiar Estado"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onViewSale(venta)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Ver Detalles"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleDelete(venta.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Eliminar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  No hay ventas disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {visibleProducts < data.length && (
        <div className="flex justify-center items-center w-full mt-4">
          <InfiniteScroll
            visibleProducts={visibleProducts}
            totalProducts={data.length}
            onLoadMore={handleLoadMore}
            text={"Ver más ventas"}
          />
        </div>
      )}
    </div>
  );
};

export default SheetsSales; 