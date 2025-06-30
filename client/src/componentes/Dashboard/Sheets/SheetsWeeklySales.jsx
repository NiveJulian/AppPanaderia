import { useEffect, useState } from "react";
import {
  FaWhatsapp,
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaSearch,
  FaFilePdf,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { generateWeeklySalesPDF } from "../../../redux/actions/salesActions";
import Loader from "../../Loader/Loader";
import ClientSalesModal from "./ClientSalesModal";
import { useParams } from "react-router-dom";

const SheetsWeeklySales = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchWeeklySales();
  }, []);

  const fetchWeeklySales = async () => {
    try {
      setLoading(true);
      let url;
      if (clientId) {
        url = `${
          import.meta.env.VITE_API_URL
        }/api/sheets/sales/weekly/client/${clientId}`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/api/sheets/sales/weekly`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener las ventas semanales");
      }
      const data = await response.json();
      // Si es por cliente, la respuesta puede ser diferente, ajusta según tu backend
      setWeeklyData(
        clientId ? { clients: [data], weekInfo: data.weekInfo } : data.total
      );
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (client) => {
    const mensaje = `Hola ${client.clientName}! 

    Resumen de tus compras esta semana (${client.weekStart} al ${
      client.weekEnd
    }):

    💰 Total gastado: $${client.totalSales}
    🛒 Cantidad de compras: ${client.salesCount}
    📊 Promedio por compra: $${client.averageSale.toFixed(2)}

    ¡Gracias por tu confianza!`;

    const numeroWhatsapp = client.clientPhone;
    if (numeroWhatsapp) {
      const enlace = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(
        mensaje
      )}`;
      window.open(enlace, "_blank");
    }
  };

  const handleGeneratePDF = (client) => {
    dispatch(generateWeeklySalesPDF(client));
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

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

  // Filtrar clientes basado en el término de búsqueda y que tengan datos válidos
  const filteredClients =
    (weeklyData?.clients?.filter(
      (client) =>
        (client.clientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (client.clientPhone || "").includes(searchTerm)
    ) || []).filter(
      (client) =>
        client && (client.clientName || client.clientPhone || client.totalSales || client.salesCount)
    );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={fetchWeeklySales}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!weeklyData || !weeklyData.clients || weeklyData.clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaCalendarAlt className="text-gray-400 text-6xl mx-auto mb-4" />
          <div className="text-gray-600 text-xl mb-2">
            No hay ventas esta semana
          </div>
          <div className="text-gray-500">
            {weeklyData?.weekInfo && (
              <div>
                Semana del {formatDate(weeklyData.weekInfo.weekStart)} al{" "}
                {formatDate(weeklyData.weekInfo.weekEnd)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header con estadísticas generales */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            Ventas Semanales
          </h2>
          <div className="text-sm text-gray-500">
            Semana {weeklyData.weekInfo?.weekNumber} del{" "}
            {formatDate(weeklyData.weekInfo?.weekStart)} al{" "}
            {formatDate(weeklyData.weekInfo?.weekEnd)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaUsers className="text-blue-500 text-xl mr-2" />
              <div>
                <div className="text-sm text-gray-600">Clientes</div>
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyData.clientsCount}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaDollarSign className="text-green-500 text-xl mr-2" />
              <div>
                <div className="text-sm text-gray-600">Total Ventas</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(weeklyData.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaDollarSign className="text-purple-500 text-xl mr-2" />
              <div>
                <div className="text-sm text-gray-600">Cantidad Ventas</div>
                <div className="text-2xl font-bold text-purple-600">
                  {weeklyData.totalSales}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaDollarSign className="text-orange-500 text-xl mr-2" />
              <div>
                <div className="text-sm text-gray-600">Promedio</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(weeklyData.averageSale)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Clientes con Compras
            </h3>

            {/* Buscador */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Información de resultados */}
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Mostrando {filteredClients.length} de {weeklyData.clients.length}{" "}
              clientes
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Compras
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Compra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, i) => {
                  // console.log(client);
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.clientPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(Number(client.totalSales) || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.salesCount ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(Number(client.averageSale) || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.lastSaleDate ? formatDate(client.lastSaleDate) : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {client.clientPhone && (
                            <button
                              onClick={() => handleSendMessage(client)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Enviar resumen por WhatsApp"
                            >
                              <FaWhatsapp size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleGeneratePDF(client)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Generar PDF de ventas semanales"
                          >
                            <FaFilePdf size={16} />
                          </button>
                          <button
                            onClick={() => handleViewDetails(client)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalles completos"
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay ventas actualmente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles del cliente */}
      <ClientSalesModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SheetsWeeklySales;
