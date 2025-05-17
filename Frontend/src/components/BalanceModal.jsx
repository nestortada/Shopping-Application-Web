import React from 'react';
import Modal from './Modal';

// Componente para el modal de Saldo
function BalanceModal({ isOpen, onClose, userBalance, onContinue }) {  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saldo"
      isPaymentModal={true}
    >
      <div className="flex flex-col space-y-6">
        <div className="bg-white rounded-[24px] shadow-md py-6 px-4">
          <p className="font-paprika text-center mb-6">Saldo disponible</p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="border border-[#E2E8F0] rounded-[12px] px-4 py-1">
              <p className="font-paprika text-[16px] opacity-25">$ {userBalance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => {
                // Aquí iría la lógica para recargar saldo
                onClose();
              }}
              className="flex-1 bg-[#F8F8F8] border border-[#CFCFCF] text-black font-paprika py-2 rounded-[12px] shadow-sm"
            >
              Recargar
            </button>
            
            <button
              onClick={onContinue}
              className="flex-1 bg-[#0E2F55] text-white font-paprika py-2 rounded-[12px] shadow-sm"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BalanceModal;
