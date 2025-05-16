import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

export default function RatingModal({ isOpen, onClose, onSubmit, productName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating, comment);
    // Reset form
    setRating(0);
    setComment('');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="rating-modal-title" role="dialog" aria-modal="true">
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal panel */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white rounded-2xl shadow-xl overflow-y-auto">
        <div className="p-6">
          <h2 id="rating-modal-title" className="text-xl font-medium text-gray-900 mb-4">
            Calificar producto
          </h2>
          
          <p className="text-gray-600 mb-4">
            ¿Qué te pareció <span className="font-medium">{productName}</span>?
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-6">
              <div className="mb-2">
                <StarRating 
                  value={rating} 
                  onChange={setRating} 
                />
              </div>
              <p className="text-sm text-gray-500">
                {rating > 0 ? `Has seleccionado ${rating} ${rating === 1 ? 'estrella' : 'estrellas'}` : 'Selecciona tu calificación'}
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5947FF]"
                rows="3"
                placeholder="Comparte tu experiencia con este producto..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={rating === 0}
                className="px-4 py-2 bg-[#5947FF] text-white rounded-xl hover:bg-[#4937e0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

RatingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired
};
