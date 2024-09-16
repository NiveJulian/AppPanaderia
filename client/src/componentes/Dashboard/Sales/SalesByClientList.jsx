import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSaleByClientID,
  getSaleByWeekly,
} from "../../../redux/actions/salesActions";
import Loader from "../../Loader/Loader";

const SalesByClientList = () => {
  const salesWeekly = useSelector((state) => state.cart.salesWeekly);
  const saleInfo = useSelector((state) => state.cart.saleInfo);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false); // Estado para mostrar loader
  const [generatingTicket, setGeneratingTicket] = useState(false); // Estado para controlar cuándo se está generando el ticket

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
    setLoading(true); // Muestra el loader mientras obtienes la venta
    try {
      await dispatch(getSaleByClientID(id)); // Realiza el dispatch para obtener la venta
      setGeneratingTicket(true); // Indica que se está generando un ticket
    } catch (error) {
      console.log(error);
      setLoading(false); // Oculta el loader si hay un error
      setGeneratingTicket(false);
    }
  }

  // Este useEffect se ejecutará cuando saleInfo cambie
  useEffect(() => {
    if (generatingTicket && saleInfo) {
      const enlaceWhatsApp = generarMensajeWhatsApp(saleInfo);
      setLoading(false); // Oculta el loader
      setGeneratingTicket(false); // Resetea el estado de generación de ticket
      window.open(enlaceWhatsApp, "_blank"); // Abre el enlace en una nueva pestaña para enviar por WhatsApp
    }
  }, [saleInfo, generatingTicket]);

  useEffect(() => {
    dispatch(getSaleByWeekly());
  }, [dispatch]);

  return (
    <div className="w-full">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Loader />
        </div>
      )}

      <div className="flex gap-2 lg:flex-col ">
        {salesWeekly &&
          salesWeekly.map((sale, i) => {
            return (
              <div
                key={i}
                className="w-full border border-teal-500 text-black bg-white rounded-md flex flex-col justify-between"
              >
                <h1 className="text-center font-bold uppercase bg-teal-300 p-2">
                  {sale.nombre}
                </h1>
                <span className="p-2 text-center">
                  <p className="font-bold">Total</p> ${sale.totalSales}
                </span>
                <button
                  onClick={() => handleTicketByWP(sale.id)}
                  className="text-white gap-2 border w-full p-1 bg-gray-600"
                >
                  Generar ticket
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SalesByClientList;
