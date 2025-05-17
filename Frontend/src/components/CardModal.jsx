import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

// Componente para el modal de Tarjetas
function CardModal({ isOpen, onClose, cards, selectedCard, setSelectedCard, onContinue, installments, setInstallments }) {
  const navigate = useNavigate();
  const isCredit = selectedCard?.type?.toLowerCase().includes('crédito');
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tarjeta de crédito o débito"
      isPaymentModal={true}
    >
      <div className="flex flex-col space-y-4">
        <div>
          <p className="font-paprika mb-2">Seleccione la tarjeta</p>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-paprika"
            value={selectedCard?.id || ''}
            onChange={(e) => {
              const card = cards.find(c => c.id === e.target.value);
              setSelectedCard(card || null);
            }}
          >
            <option value="">Seleccionar tarjeta</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>
                {card.type} **** {card.last4}
              </option>
            ))}
          </select>
        </div>
        
        {selectedCard && isCredit && (
          <div>
            <p className="font-paprika mb-2">Cuotas</p>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-paprika"
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
            >
              {[1, 3, 6, 12, 18, 24, 36].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-between mt-4">          
          <button
            onClick={() => {
              navigate('/add-card');
              onClose(); // Cerramos el modal para mejorar la experiencia de usuario
            }}
            className="bg-gray-100 text-[#0F172A] font-paprika py-2 px-4 rounded-lg"
          >
            Agregar tarjeta
          </button>
          
          <button
            onClick={onContinue}
            disabled={!selectedCard}
            className={`${
              selectedCard 
                ? 'bg-[#0E2F55] text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } font-paprika py-2 px-4 rounded-lg`}
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CardModal;
