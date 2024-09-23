import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSaleByClientID } from "../../../redux/actions/salesActions";
import Loader from "../../Loader/Loader";

const SalesByClientList = ({ saleInfo, salesWeekly }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [generatingTicket, setGeneratingTicket] = useState(false);

  const enviarDatosAlBackend = async (saleInfo) => {
    try {
      const productos = saleInfo.products.map((producto, index) => ({
        name: producto.nombre,
        quantity: saleInfo.quantities[index],
        unitPrice: producto.precio,
        subtotal: producto.precio * saleInfo.quantities[index],
      }));

      const saleData = {
        clientName: saleInfo.client.nombre,
        contactNumber: saleInfo.client.celular,
        products: productos,
        total: saleInfo.totalPrice,
      };

      const response = await fetch(
        "https://server-espigadeoro.vercel.app/api/ticket/generate-ticket",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saleData),
        }
      );

      if (response.ok) {
        // Descargar el ticket PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ticket-${saleData.clientName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.log("Error generando el ticket");
      }
    } catch (error) {
      console.log("Error en el envío de datos al backend:", error);
    }
  };

  async function handleTicketByWP(id) {
    setLoading(true);
    try {
      await dispatch(getSaleByClientID(id));
      setGeneratingTicket(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setGeneratingTicket(false);
    }
  }

  useEffect(() => {
    if (generatingTicket && saleInfo) {
      enviarDatosAlBackend(saleInfo);
      setLoading(false);
      setGeneratingTicket(false);
    }
  }, [saleInfo, generatingTicket]);

  return (
    <div className="w-full p-4">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Loader />
        </div>
      )}

      <div className="flex flex-row gap-4 md:flex-col md:flex-wrap md:gap-6">
        {salesWeekly &&
          salesWeekly.map((sale) => {
            return (
              <div
                key={sale.id}
                className="border border-teal-500 text-black bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between w-full"
              >
                <h1 className="text-center font-bold uppercase bg-teal-300 p-2 rounded-t-lg">
                  {sale.nombre}
                </h1>
                <p className="font-bold text-center mt-2">Total</p>
                <span className="p-2 text-center w-full font-semibold text-xl">
                  ${sale.totalSales}
                </span>
                <button
                  onClick={() => handleTicketByWP(sale.id)}
                  className="text-white mt-4 border border-transparent bg-gray-600 p-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Crear ticket
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SalesByClientList;
