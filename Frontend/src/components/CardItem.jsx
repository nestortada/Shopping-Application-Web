import React from 'react';

export default function CardItem({ type, last4, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center">
        <p className="text-lg font-bold">{type}</p>
        <p className="text-gray-500 ml-4">**** **** **** {last4}</p>
      </div>
      <button
        onClick={onDelete} // Llamar a la función para abrir el modal
        className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold"
      >
        ✕
      </button>
    </div>
  );
}