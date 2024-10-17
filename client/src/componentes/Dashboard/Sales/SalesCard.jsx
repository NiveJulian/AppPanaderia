import { useState } from 'react';

const SalesCard = ({ weekData, isOpen, onToggle }) => {
  // Función para agrupar ventas por fecha
  const groupSalesByDate = (sales) => {
    return sales.reduce((groupedSales, sale) => {
      const { saleDate } = sale;

      if (!groupedSales[saleDate]) {
        groupedSales[saleDate] = [];
      }

      groupedSales[saleDate].push(sale);
      return groupedSales;
    }, {});
  };

  const groupedSales = groupSalesByDate(weekData.sales); // Agrupar ventas por fecha

  // Ordenar las fechas de las ventas de menor a mayor
  const orderedDates = Object.keys(groupedSales).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="relative border w-full bg-accent border-primary p-4 rounded-lg shadow-lg flex flex-col justify-between">
      {/* Header de la semana con click para abrir/cerrar */}
      <div
        className="flex justify-between items-center w-full cursor-pointer"
        onClick={onToggle} // Usar la función de toggle del componente principal
      >
        <h3 className="text-lg font-bold mb-2">Semana #{weekData.week}</h3>
        <span className="flex gap-1 border border-primary p-1 rounded-md bg-greenMoss text-white">
          {weekData.weekStart} - {weekData.weekEnd}
        </span>
      </div>

      {/* Mostrar ventas solo si la semana está abierta */}
      {isOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center w-full h-full bg-black bg-opacity-75 z-50"
          onClick={onToggle} // Cerrar popup al hacer click fuera
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl mx-auto overflow-y-auto h-3/4 md:h-72 relative"
            onClick={(e) => e.stopPropagation()} // Evitar que el click dentro del popup lo cierre
          >
            <button
              className="absolute top-2 right-2 bg-white text-black p-1 rounded-full"
              onClick={onToggle} // Botón para cerrar
            >
              X
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">Ingresos diarios</h2>

            {orderedDates.map((saleDate, saleIndex) => (
              <div key={saleIndex} className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-lg font-semibold">
                  <strong>Fecha:</strong> {saleDate}
                </p>
                {groupedSales[saleDate].map((sale, idx) => (
                  <div key={idx} className="ml-4">
                    <p>
                      <strong>Monto:</strong> ${sale.amount}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCard;
