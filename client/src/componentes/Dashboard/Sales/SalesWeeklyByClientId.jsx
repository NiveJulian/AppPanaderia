const SalesWeeklyByClientId = ({ data }) => {
    return (
      <div className="w-full">
        <div className="grid overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-gray-300 rounded-md">
          {data.length > 0 ? (
            data.map((weekData, index) => (
              <div
                key={index}
                className="border w-full bg-accent border-primary p-4 rounded-lg shadow-lg flex flex-col justify-between"
              >
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-lg font-bold mb-2">Semana #{weekData.week}</h3>
                  <span className="flex gap-1 border border-primary p-1 rounded-md bg-greenMoss text-white">
                    {weekData.weekStart} - {weekData.weekEnd}
                  </span>
                </div>
                <div className="w-full">
                  <p>
                    <strong>Total de ventas:</strong> ${weekData.totalSales}
                  </p>
                  <div className="mt-2">
                    <strong>Ventas:</strong>
                    {weekData.sales.map((sale, saleIndex) => (
                      <div key={saleIndex} className="border-t border-gray-200 pt-2 mt-2">
                        <p>
                          <strong>Fecha:</strong> {sale.saleDate}
                        </p>
                        <p>
                          <strong>Monto:</strong> ${sale.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <p>No hay ventas disponibles</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default SalesWeeklyByClientId;
  