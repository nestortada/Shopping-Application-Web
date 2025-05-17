import React from 'react';
import PropTypes from 'prop-types';

export default function StarRating({ value, max = 5, onChange, readOnly = false }) {
  // Convertimos el valor a un número entre 0 y max
  const rating = Math.max(0, Math.min(value, max));
  
  // Función para renderizar una estrella
  const renderStar = (index) => {
    // Determinar si la estrella está llena, media o vacía
    const isFilled = index < Math.floor(rating);
    const isHalfFilled = !isFilled && index < Math.ceil(rating) && (rating % 1) > 0;
    
    return (
      <span 
        key={index}
        className={`text-xl cursor-${readOnly ? 'default' : 'pointer'}`}
        onClick={() => !readOnly && onChange && onChange(index + 1)}
        role={!readOnly ? "button" : undefined}
        aria-label={!readOnly ? `Rate ${index + 1} of ${max}` : undefined}
      >
        {isFilled ? (
          <span className="text-yellow-400">★</span>
        ) : isHalfFilled ? (
          <span className="text-yellow-400">★</span>
        ) : (
          <span className="text-gray-300">☆</span>
        )}
      </span>
    );
  };
  
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, index) => renderStar(index))}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool
};
