import React, { useState, useEffect } from "react";
import Loader from "../../Loader/Loader";
import instance from "../../../api/axiosConfig";
import getUserFromSessionStorage from "../../getSession";

const SalesByClientList = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState({});

  useEffect(() => {
    const fetchClientsAndSales = async () => {
      setLoading(true);
      const user = getUserFromSessionStorage();
      // 1. Obtener clientes del usuario
      const resClients = await instance.get(`/api/clients/user/${user.uid}`);
      setClients(resClients.data);

      // 2. Para cada cliente, obtener ventas del año y filtrar el mes actual
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const totals = {};
      await Promise.all(
        resClients.data.map(async (client) => {
          const res = await instance.get(
            `/api/sheets/sales/monthly/client/${client.id}/${year}`
          );
          const monthData = res.data.find((m) => m.month === month);
          totals[client.id] = monthData ? monthData.total : 0;
        })
      );
      setMonthlyTotals(totals);
      setLoading(false);
    };
    fetchClientsAndSales();
  }, []);

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      {clients.map((client) => (
        <div
          key={client.id}
          className="border border-blue-400 rounded-lg shadow-lg p-4 bg-white"
        >
          <h2 className="font-bold text-lg mb-2">{client.name}</h2>
          <p className="text-gray-600">Total ventas mes actual:</p>
          <span className="text-2xl font-bold text-blue-600">
            ${monthlyTotals[client.id] || 0}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SalesByClientList;
