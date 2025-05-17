import React from 'react';

export default function DeleteCardModal({ card, onConfirm, onCancel, error, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo negro detrás del modal */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Contenido del modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md z-10">
        <h2 className="text-red-600 text-xl font-bold text-center mb-4">Eliminar tarjeta</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <p className="text-center text-gray-700 mb-4">
          ¿Realmente quieres eliminar esta tarjeta? <br />
          <span className="font-bold">No podrás cancelar esta acción.</span>
        </p>
        <div className="flex justify-around">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? 'Eliminando...' : 'Sí, borrar tarjeta'}
          </button>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className={`bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            No, regresar
          </button>
        </div>
      </div>
    </div>
  );
}
