import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Componente de Drawer Reutilizable
function Drawer({ isOpen, onClose, children }) {  
  return (
    <AnimatePresence>
      {isOpen && (
        <>          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={onClose}
          />          
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: '50%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[30px] z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] h-auto max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
