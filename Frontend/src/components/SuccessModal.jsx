// src/components/SuccessModal.jsx
import React from 'react';

export default function SuccessModal({ onClose }) {
  return (
    // Contenedor fijo centrado, sin overlay gris
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto bg-white rounded-lg px-4 pt-5 pb-4
                   text-left overflow-hidden shadow-xl transform transition-all
                   sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="sm:flex sm:items-start">
          <div
            className="mx-auto flex-shrink-0 flex items-center justify-center
                       h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10"
          >
            <svg
              className="h-6 w-6 text-green-600"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3
              className="text-lg leading-6 font-medium text-gray-900"
              id="modal-headline"
            >
              Registro exitoso
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                Ya se ha registrado su cuenta exitosamente en la página.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center w-full rounded-md border border-transparent
                       px-4 py-2 bg-green-600 text-base font-medium text-white shadow-sm
                       hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-green-500 transition ease-in-out duration-150 sm:ml-3
                       sm:w-auto sm:text-sm"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
