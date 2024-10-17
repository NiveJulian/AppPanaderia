import { useState } from 'react';
import SalesCard from './SalesCard'; // Importar el componente de la carta

const SalesWeeklyByClientId = ({ data }) => {
  const [activeCard, setActiveCard] = useState(null);

  // Función para manejar el despliegue de las cartas
  const handleToggle = (weekIndex) => {
    setActiveCard(activeCard === weekIndex ? null : weekIndex); // Solo una carta abierta a la vez
  };

  return (
    <div className="w-full">
      <div className="grid h-screen overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-gray-300 rounded-md">
        {data.length > 0 ? (
          data.map((weekData, index) => (
            <SalesCard
              key={index}
              weekData={weekData}
              isOpen={activeCard === index} // Solo esta carta está abierta si coincide el índice
              onToggle={() => handleToggle(index)} // Pasar la función para controlar el toggle
            />
          ))
        ) : (
          <div className="flex items-center justify-center bg-gray-800 bg-opacity-50">
            <p>No hay ventas disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesWeeklyByClientId;
