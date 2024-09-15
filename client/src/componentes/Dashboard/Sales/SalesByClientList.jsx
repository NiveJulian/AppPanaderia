import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSaleByClientID, getSaleByWeekly } from "../../../redux/actions/salesActions";

const SalesByClientList = () => {
  const salesWeekly = useSelector((state) => state.cart.salesWeekly);
  const saleInfo = useSelector((state) => state.cart.saleInfo);
  const dispatch = useDispatch();

  // Función para generar el mensaje de WhatsApp
  const generarMensajeWhatsApp = (venta) => {
    // Recorrer los productos y las cantidades
    const productos = venta.products
      .map(
        (producto, index) =>
          `Producto: ${producto.nombre} - Cantidad: ${venta.quantities[index]} - Precio Unitario: $${producto.precio} - Subtotal: $${producto.precio * venta.quantities[index]}`
      )
      .join("\n");

    const mensaje = `*Ticket de Venta*\n\nCliente: ${venta.client.nombre}\nNúmero de Contacto: ${venta.client.celular}\n\n${productos}\n\nTotal de la compra: $${venta.totalPrice}`;

    // Generar enlace para WhatsApp
    const numeroWhatsapp = venta.client.celular; // Usa el celular del cliente
    const enlace = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(
      mensaje
    )}`;
    return enlace;
  };

  // Manejar envío del ticket por WhatsApp
  async function handleTicketByWP(id) {
    try {
      await dispatch(getSaleByClientID(id));
      if (saleInfo.length > 0) {
        const enlaceWhatsApp = generarMensajeWhatsApp(saleInfo);
        window.open(enlaceWhatsApp, "_blank"); // Abre el enlace en una nueva pestaña para enviar por WhatsApp
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    dispatch(getSaleByWeekly());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="flex gap-1 lg:flex-col flex-row lg:overflow-hidden overflow-x-scroll">
        {salesWeekly &&
          salesWeekly.map((sale, i) => {
            return (
              <div
                key={i}
                className="w-full border border-yellow-400 text-white bg-yellow-600 rounded-md"
              >
                <div className="flex">
                  <h1 className="text-center font-bold uppercase border p-2 border-yellow-400">
                    {sale.nombre}
                  </h1>
                  <div className="flex flex-col border border-yellow-400">
                    <div className="p-2 text-center flex justify-between gap-4 items-center">
                      Comienzo semana
                      <span className="flex border items-center rounded-md p-2 bg-gray-200 text-black">
                        {sale.weekStart}
                      </span>
                    </div>
                    <div className="p-2 text-center flex justify-between gap-4 items-center">
                      Final de semana
                      <span className="flex border items-center rounded-md p-2 bg-gray-200 text-black">
                        {sale.weekEnd}
                      </span>
                    </div>
                    <span className="p-2 border-t border-yellow-400 text-center">
                      <p className="font-bold">Total</p> ${sale.totalSales}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleTicketByWP(sale.id)}
                  className="flex items-center justify-center gap-2 border w-full p-1 bg-gray-600 rounded-md"
                >
                  Generar ticket{" "}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SalesByClientList;
