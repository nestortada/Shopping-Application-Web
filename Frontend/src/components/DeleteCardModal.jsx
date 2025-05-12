import React from 'react';

export default function DeleteCardModal({ card, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo negro detrás del modal */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Contenido del modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md z-10">
        <h2 className="text-red-600 text-xl font-bold text-center mb-4">Eliminar tarjeta</h2>
        <p className="text-center text-gray-700 mb-4">
          ¿Realmente quieres eliminar esta tarjeta? <br />
          <span className="font-bold">No podrás cancelar esta acción.</span>
        </p>
        <div className="flex justify-around">
          <button
            onClick={onConfirm}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Sí, borrar tarjeta
          </button>
          <button
            onClick={onCancel}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            No, regresar
          </button>
        </div>
      </div>
    </div>
  );
}