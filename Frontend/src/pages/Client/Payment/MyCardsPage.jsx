import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardContext } from '../../../context/CardContext';
import CardItem from '../../../components/CardItem';
import DeleteCardModal from '../../../components/DeleteCardModal';

export default function MyCardsPage() {
  const navigate = useNavigate();
  const { cards, deleteCard, loading, error, isCardManagementAllowed, fetchCards } = useCardContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Verificar si el usuario puede acceder a esta funcionalidad y cargar tarjetas
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const allowed = isCardManagementAllowed(userEmail);
    setIsAllowed(allowed);
    
    if (allowed) {
      fetchCards();
    }
  }, [isCardManagementAllowed, fetchCards]);

  const openDeleteModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteCard = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      // Eliminar la tarjeta seleccionada
      const result = await deleteCard(selectedCard.id);
      
      if (result && result.success) {
        setIsModalOpen(false); // Cerrar el modal
      } else {
        setDeleteError(result.error || 'Error al eliminar la tarjeta');
      }
    } catch (error) {
      console.error('Error al eliminar tarjeta:', error);
      setDeleteError(error.message || 'Ha ocurrido un error al eliminar la tarjeta');
    } finally {
      setIsDeleting(false);
    }
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {!isAllowed ? (
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-red-600 mb-4">
              No tienes permiso para acceder a esta funcionalidad.
            </p>
            <p className="mb-4">
              El manejo de tarjetas solo está disponible para usuarios con correo @unisabana.edu.co
            </p>
            <button
              onClick={() => navigate('/map')}
              className="bg-[#3822B4] text-white py-2 px-4 rounded-lg"
            >
              Volver al mapa
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-lg" aria-live="polite">
                <span className="sr-only">Cargando tarjetas</span>
                Cargando...
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4">
                {cards.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      No tienes tarjetas registradas
                    </p>
                  </div>
                ) : (
                  cards.map((card) => (
                    <CardItem
                      key={card.id}
                      type={card.type}
                      last4={card.last4}
                      onDelete={() => openDeleteModal(card)}
                    />
                  ))
                )}
              </div>
            )}
            
            <button
              onClick={() => navigate('/add-card')}
              className="mt-4 w-full bg-[#0E2F55] text-white py-2 rounded-lg text-lg font-bold"
            >
              Agregar tarjeta
            </button>
          </>
        )}
      </main>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <DeleteCardModal
          card={selectedCard}
          onConfirm={handleDeleteCard}
          onCancel={() => setIsModalOpen(false)}
          error={deleteError}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}