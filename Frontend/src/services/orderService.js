const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Creates a new order
 * @param {Object} orderData - The order data
 * @returns {Promise} - Response from the API
 */
export async function createOrder(orderData) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    const res = await fetch(`${BACKEND_URL}${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
      throw new Error('Error al crear el pedido');
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Valida la disponibilidad de productos para un pedido
 * @param {Array} items - Lista de productos con sus cantidades
 * @returns {Promise} - Respuesta de la API
 */
export async function validateOrderAvailability(items) {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  if (!userEmail || !userEmail.endsWith('@sabanapos.edu.co')) {
    throw new Error('Solo usuarios POS pueden validar pedidos');
  }

  try {
    console.log(`Enviando petición a: ${BACKEND_URL}${API_URL}/orders/validate`);
    console.log('Token:', token);
    console.log('Email del usuario:', userEmail);
    console.log('Items a validar:', items);
    
    const res = await fetch(`${BACKEND_URL}${API_URL}/orders/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items })
    });

    console.log('Respuesta de la API:', res.status, res.statusText);

    if (!res.ok) {
      // Intentar leer el cuerpo del error
      try {
        const errorData = await res.json();
        console.log('Error de la API:', errorData);
        throw new Error(errorData.message || `Error HTTP: ${res.status}`);
      } catch (jsonError) {
        // Si no podemos parsear el JSON, usamos el estado HTTP
        throw new Error(`Error HTTP: ${res.status}`);
      }
    }

    const data = await res.json();
    return data;
    
  } catch (error) {
    console.error('Error al validar productos:', error);
    throw error;
  }
}
