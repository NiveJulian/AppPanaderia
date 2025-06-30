import React from "react";

const TabDeleteClientModal = ({ isOpen, onClose, onConfirm, clientName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-red-600">
          Eliminar cliente
        </h2>
        <p className="mb-4">
          ¿Estás seguro de que deseas eliminar al cliente <b>{clientName}</b> y
          todos sus productos asociados? <br />
          <span className="text-xs text-gray-500">
            (Las ventas NO se eliminarán)
          </span>
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabDeleteClientModal;
