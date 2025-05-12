import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardContext } from '../../../context/CardContext';
import CardItem from '../../../components/CardItem';
import DeleteCardModal from '../../../components/DeleteCardModal';

export default function MyCardsPage() {
  const navigate = useNavigate();
  const { cards, deleteCard } = useCardContext(); // Obtener las tarjetas y la función para eliminar
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal
  const [selectedCard, setSelectedCard] = useState(null); // Tarjeta seleccionada para eliminar

  const openDeleteModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = () => {
    deleteCard(selectedCard.id); // Eliminar la tarjeta seleccionada
    setIsModalOpen(false); // Cerrar el modal
  };

  const handleBackClick = () => {
    navigate('/map'); // Redirigir al mapa
  };

  return (
    <div className="relative flex flex-col h-screen bg-[#FBFBFA]">
      {/* Header */}
      <header className="bg-[#3822B4] text-white flex items-center px-4 py-3">
        <button onClick={handleBackClick} className="text-2xl font-bold">←</button>
        <h1 className="flex-1 text-center text-lg font-bold">Mis tarjetas</h1>
      </header>

      {/* Tarjetas */}
      <main className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              type={card.type}
              last4={card.last4}
              onDelete={() => openDeleteModal(card)} // Abrir el modal al hacer clic en la X
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/add-card')}
          className="mt-4 w-full bg-[#0E2F55] text-white py-2 rounded-lg text-lg font-bold"
        >
          Agregar tarjeta
        </button>
      </main>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <DeleteCardModal
          card={selectedCard}
          onConfirm={handleDeleteCard} // Confirmar eliminación
          onCancel={() => setIsModalOpen(false)} // Cancelar eliminación
        />
      )}
    </div>
  );
}