import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { SHA256 } from 'crypto-js';

// Crear el contexto
const CardContext = createContext();

// Proveedor del contexto
export function CardProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Función para verificar si un usuario puede acceder al módulo de tarjetas
  const isCardManagementAllowed = useCallback((userEmail) => {
    // Si no hay correo proporcionado, usar el de localStorage
    const email = userEmail || localStorage.getItem('userEmail');
    
    // Actualizar el correo del usuario actual para el contexto
    if (email && currentUserEmail !== email) {
      setCurrentUserEmail(email);
    }
    
    // Solo los usuarios con correos que terminan en @unisabana.edu.co y que tienen perfil "cliente" pueden usar tarjetas
    // Los usuarios con correos que terminan en @sabanapos.edu.co NO pueden usar tarjetas
    const isAllowed = (email && email.endsWith('@unisabana.edu.co'));
    console.log(`Verificando si ${email} puede gestionar tarjetas: ${isAllowed}`);
    return isAllowed;
  }, [currentUserEmail]);

  // Hashear el número de tarjeta para almacenarlo de forma segura
  const hashCardNumber = (cardNumber) => {
    return SHA256(cardNumber).toString();
  };

  // Obtener tarjetas de Firestore específicamente para el usuario actual
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      // Verificar token JWT y correo de usuario desde localStorage
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token || !userEmail) {
        // El usuario no ha iniciado sesión, no podemos obtener tarjetas
        setCards([]);
        return;
      }

      // Verificar si el usuario puede gestionar tarjetas
      if (!isCardManagementAllowed(userEmail)) {
        setCards([]);
        return;
      }

      // Actualizar el correo del usuario actual
      setCurrentUserEmail(userEmail);

      // Consultar Firestore para obtener tarjetas específicas de este usuario
      const cardsRef = collection(db, 'tarjetas');
      const q = query(cardsRef, where('userEmail', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      const cardsList = [];
      querySnapshot.forEach(doc => {
        cardsList.push({
          ...doc.data(),
          id: doc.id, // Guardar el ID del documento de Firestore
          // No incluir el hash del número de tarjeta en la respuesta al cliente
        });
      });
      
      setCards(cardsList);
    } catch (err) {
      console.error('Error al obtener tarjetas de Firestore:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail, isCardManagementAllowed]);

  // Agregar una tarjeta
  const addCard = useCallback(async (card) => {
    try {
      setLoading(true);
      // Verificar token JWT desde localStorage
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token || !userEmail) {
        throw new Error('Debes iniciar sesión para añadir tarjetas');
      }

      // Verificar si el usuario puede gestionar tarjetas
      if (!isCardManagementAllowed(userEmail)) {
        throw new Error('No tienes permisos para gestionar tarjetas');
      }

      // Actualizar el correo del usuario actual
      setCurrentUserEmail(userEmail);

      // Hashear el número de la tarjeta para almacenamiento seguro
      const hashedNumber = hashCardNumber(card.number);
      
      // Extraer los últimos 4 dígitos para mostrarlos
      const last4 = card.number.slice(-4);

      // Preparar objeto de tarjeta para Firestore
      const cardToAdd = {
        holderName: card.holder,
        hashedNumber: hashedNumber,
        last4: last4,
        expiryDate: card.expiry,
        type: card.type || 'crédito',
        userEmail: userEmail,
        userProfile: 'cliente', // Asumimos perfil cliente para usuarios con correo @unisabana.edu.co
        createdAt: new Date()
      };
      
      // Añadir a Firestore
      const docRef = await addDoc(collection(db, 'tarjetas'), cardToAdd);
      
      // Actualizar estado con la nueva tarjeta
      setCards(prevCards => [...prevCards, {
        ...cardToAdd,
        id: docRef.id,
        // No incluir el hash del número de tarjeta en la respuesta al cliente
        hashedNumber: undefined
      }]);

      return { success: true };
    } catch (err) {
      console.error('Error al añadir tarjeta a Firestore:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail, isCardManagementAllowed]);

  // Eliminar una tarjeta
  const deleteCard = useCallback(async (id) => {
    try {
      setLoading(true);
      // Verificar token JWT desde localStorage
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token || !userEmail) {
        throw new Error('Debes iniciar sesión para eliminar tarjetas');
      }

      // Verificar si el usuario puede gestionar tarjetas
      if (!isCardManagementAllowed(userEmail)) {
        throw new Error('No tienes permisos para gestionar tarjetas');
      }

      // Verificar que la tarjeta pertenezca al usuario
      const cardDoc = await getDoc(doc(db, 'tarjetas', id));
      if (!cardDoc.exists() || cardDoc.data().userEmail !== userEmail) {
        throw new Error('No tienes permiso para eliminar esta tarjeta');
      }
      
      // Eliminar de Firestore
      await deleteDoc(doc(db, 'tarjetas', id));
      
      // Actualizar estado
      setCards(prevCards => prevCards.filter(card => card.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar tarjeta de Firestore:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail, isCardManagementAllowed]);

  // Cargar tarjetas cuando el componente se monta o cuando cambia el usuario
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail !== currentUserEmail) {
      setCurrentUserEmail(userEmail);
      fetchCards();
    }
  }, [fetchCards, currentUserEmail]);

  // Recargar tarjetas cuando cambia el usuario
  useEffect(() => {
    if (currentUserEmail) {
      fetchCards();
    }
  }, [currentUserEmail, fetchCards]);

  return (
    <CardContext.Provider value={{ 
      cards, 
      loading, 
      error,
      addCard, 
      deleteCard, 
      isCardManagementAllowed,
      fetchCards
    }}>
      {children}
    </CardContext.Provider>
  );
}

// Hook para usar el contexto
export function useCardContext() {
  return useContext(CardContext);
}