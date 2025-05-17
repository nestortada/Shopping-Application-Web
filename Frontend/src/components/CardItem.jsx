import React from 'react';
import visaIcon from '../assets/visa.png'; // Asumiendo que este icono ya existe

export default function CardItem({ type, last4, onDelete }) {
  // Función para obtener el icono de la tarjeta según su tipo
  const getCardIcon = () => {
    if (type.toLowerCase().includes('visa')) {
      return visaIcon;
    }
    // Puedes agregar más íconos para otros tipos de tarjeta aquí
    return null;
  };

  // Determinar el color según el tipo de tarjeta
  const getCardColorClass = () => {
    if (type.toLowerCase().includes('débito')) {
      return 'bg-blue-100'; // Fondo azul para tarjetas de débito
    } else if (type.toLowerCase().includes('crédito')) {
      return 'bg-purple-100'; // Fondo púrpura para tarjetas de crédito
    }
    return 'bg-white'; // Valor por defecto
  };

  // Formatea el tipo de tarjeta para mostrarlo de forma más amigable
  const formattedType = () => {
    // Convertir a minúsculas y luego capitalizar la primera letra
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    
    // Si no incluye las palabras "débito" o "crédito", asumir que es una marca
    if (!capitalizedType.includes('débito') && !capitalizedType.includes('crédito')) {
      // Si es una marca como "Visa", añadir "Crédito" como sufijo por defecto
      return `${capitalizedType} Crédito`;
    }
    
    return capitalizedType;
  };

  return (
    <div className={`flex items-center justify-between ${getCardColorClass()} rounded-lg shadow-md p-4 mb-4`}>
      <div className="flex items-center">
        {getCardIcon() && (
          <img src={getCardIcon()} alt={type} className="w-8 h-6 mr-3" />
        )}
        <div>
          <p className="text-lg font-bold">{formattedType()}</p>
          <p className="text-gray-500">**** **** **** {last4}</p>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold"
        aria-label="Eliminar tarjeta"
      >
        ✕
      </button>
    </div>
  );
}
