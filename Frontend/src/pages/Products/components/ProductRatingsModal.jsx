import React from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

export default function ProductRatingsModal({ isOpen, onClose, ratings }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" onClick={onClose} aria-hidden="true"></div>
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white rounded-2xl shadow-xl overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Calificaciones del producto
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ×
          </button>
          {ratings.length === 0 ? (
            <p className="text-gray-500">Este producto aún no tiene calificaciones.</p>
          ) : (
            <ul className="space-y-4">
              {ratings.map((r, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div className="flex items-center mb-1">
                    <StarRating value={r.rating} readOnly />
                    <span className="ml-2 text-xs text-gray-400">{r.userEmail || 'Anónimo'}</span>
                  </div>
                  <div className="text-sm text-gray-700">{r.comment || <span className="italic text-gray-400">Sin comentario</span>}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

ProductRatingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ratings: PropTypes.arrayOf(
    PropTypes.shape({
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string,
      userEmail: PropTypes.string,
    })
  ).isRequired,
};