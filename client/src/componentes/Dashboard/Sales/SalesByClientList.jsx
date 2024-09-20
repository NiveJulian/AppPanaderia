import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSaleByClientID,
  getSaleByWeekly,
  getSaleByWeeklyByUser,
} from "../../../redux/actions/salesActions";
import Loader from "../../Loader/Loader";

const SalesByClientList = ({ idUser }) => {
  const salesWeekly = useSelector((state) => state.cart.salesWeekly);
  const saleInfo = useSelector((state) => state.cart.saleInfo);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [generatingTicket, setGeneratingTicket] = useState(false);

  // Función para generar el mensaje de WhatsApp
  const generarMensajeWhatsApp = (venta) => {
    const productos = venta.products
      .map(
        (producto, index) => `- *Producto*: ${producto.nombre}
          - *Cantidad*: ${venta.quantities[index]} 
          - *Precio Unitario*: $${producto.precio} 
          - *Subtotal*: $${producto.precio * venta.quantities[index]}\n`
      )
      .join("\n");

    const mensaje = `*Ticket de Venta*\n\nCliente: ${venta.client.nombre}\nNúmero de Contacto: ${venta.client.celular}\n\n${productos}\n\nTotal de la compra: $${venta.totalPrice}`;

    const numeroWhatsapp = venta.client.celular;
    const enlace = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(
      mensaje
    )}`;
    return enlace;
  };

  // Función que maneja la generación del ticket
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
      const enlaceWhatsApp = generarMensajeWhatsApp(saleInfo);
      setLoading(false);
      setGeneratingTicket(false);
      window.open(enlaceWhatsApp, "_blank");
    }
  }, [saleInfo, generatingTicket]);

  useEffect(() => {
    dispatch(getSaleByWeeklyByUser(idUser));
  }, [dispatch, idUser]);

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
                className="border border-teal-500 text-black bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between w-full md:w-80 lg:w-96"
              >
                <h1 className="text-center font-bold uppercase bg-teal-300 p-2 rounded-t-lg">
                  {sale.nombre}
                </h1>
                <p className="font-bold text-center mt-2">Total</p>
                <span className="p-2 text-center w-full font-semibold text-xl">
                  ${sale.totalSales}
                </span>
                {sale.celular && sale.celular.trim() !== "" && (
                  <button
                    onClick={() => handleTicketByWP(sale.id)}
                    className="text-white mt-4 border border-transparent bg-gray-600 p-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Generar ticket
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SalesByClientList;
