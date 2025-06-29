import { FaTimes, FaWhatsapp, FaCalendarAlt, FaDollarSign, FaShoppingCart } from "react-icons/fa";

const ClientSalesModal = ({ client, isOpen, onClose }) => {
  if (!isOpen || !client) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString || "N/A";
  };

  const handleSendMessage = () => {
    const mensaje = `Hola ${client.clientName}! 

Resumen detallado de tus compras esta semana (${client.weekStart} al ${client.weekEnd}):

💰 Total gastado: $${client.totalSales}
🛒 Cantidad de compras: ${client.salesCount}
📊 Promedio por compra: $${client.averageSale.toFixed(2)}

Detalles de productos:
${client.products.map(product => {
  const subtotal = product.quantity * product.price;
  return `• ${product.productName} - Cantidad: ${product.quantity} - Precio: $${product.price} - Subtotal: $${subtotal.toFixed(2)}`;
}).join('\n')}

¡Gracias por tu confianza!`;

    const numeroWhatsapp = client.clientPhone;
    if (numeroWhatsapp) {
      const enlace = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;
      window.open(enlace, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaShoppingCart className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{client.clientName}</h2>
              <p className="text-gray-600">{client.clientPhone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Resumen de la semana */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Resumen Semanal
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaDollarSign className="text-blue-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Total Gastado</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(client.totalSales)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaShoppingCart className="text-green-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Cantidad Compras</div>
                    <div className="text-xl font-bold text-green-600">
                      {client.salesCount}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaDollarSign className="text-purple-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Promedio</div>
                    <div className="text-xl font-bold text-purple-600">
                      {formatCurrency(client.averageSale)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-orange-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Última Compra</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatDate(client.lastSaleDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la semana */}
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Período:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(client.weekStart)} - {formatDate(client.weekEnd)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Métodos de Pago:</span>
                  <span className="ml-2 text-gray-600">
                    {client.paymentMethods.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Detalle de Productos Comprados
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Precio Unitario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Subtotal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {client.products.map((product, index) => {
                    const subtotal = product.quantity * product.price;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.quantity}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(product.price)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(subtotal)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(product.saleDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTime(product.saleTime)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico de productos más comprados */}
          {client.products.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Productos Más Comprados
              </h3>
              <div className="space-y-3">
                {client.products
                  .reduce((acc, product) => {
                    const existing = acc.find(p => p.productName === product.productName);
                    if (existing) {
                      existing.quantity += product.quantity;
                      existing.subtotal += (product.quantity * product.price);
                    } else {
                      acc.push({
                        productName: product.productName,
                        quantity: product.quantity,
                        subtotal: product.quantity * product.price,
                      });
                    }
                    return acc;
                  }, [])
                  .sort((a, b) => b.quantity - a.quantity)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Cantidad total: {product.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(product.subtotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            Total de productos diferentes: {new Set(client.products.map(p => p.productName)).size}
          </div>
          <div className="flex space-x-3">
            {client.clientPhone && (
              <button
                onClick={handleSendMessage}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp className="mr-2" />
                Enviar Resumen
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSalesModal; 