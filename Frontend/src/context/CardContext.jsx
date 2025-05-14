import React, { createContext, useState, useContext } from 'react';

// Crear el contexto
const CardContext = createContext();

// Proveedor del contexto
export function CardProvider({ children }) {
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '2196' }, // Tarjeta inicial
  ]);

  // Función para agregar una tarjeta
  const addCard = (card) => {
    setCards((prevCards) => [...prevCards, { id: prevCards.length + 1, ...card }]);
  };

  // Función para eliminar una tarjeta
  const deleteCard = (id) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== id));
  };

  return (
    <CardContext.Provider value={{ cards, addCard, deleteCard }}>
      {children}
    </CardContext.Provider>
  );
}

// Hook para usar el contexto
export function useCardContext() {
  return useContext(CardContext);
}