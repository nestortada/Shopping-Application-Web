import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Componente de Modal Reutilizable
function Modal({ isOpen, onClose, children, title, isPaymentModal = false }) {
  // Los modales de pago (tarjetas y saldo) deben tener un z-index más alto
  const zIndexClass = isPaymentModal ? "z-60" : "z-50";
  // Hacemos el fondo más transparente para los modales de pago para que se vea el CartPage detrás
  const backdropClass = isPaymentModal ? "bg-opacity-20" : "bg-opacity-50";
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center`}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${backdropClass}`}
            onClick={onClose}
          />          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${isPaymentModal ? 'bg-white/95' : 'bg-white'} rounded-xl p-6 shadow-xl z-10 max-w-md w-full mx-4`}
          >
            {title && <h2 className="text-xl font-paprika mb-4 text-center">{title}</h2>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
