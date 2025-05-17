import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useOrderContext } from '../../../context/OrderContext';

export default function PosOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posLocation, setPosLocation] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateOrderStatus } = useOrderContext();
  useEffect(() => {
    const fetchPosOrders = async () => {
      try {
        setLoading(true);
        
        // Get the POS user email from localStorage
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail || !userEmail.endsWith('@sabanapos.edu.co')) {
          throw new Error('Acceso no autorizado. Esta página es solo para usuarios POS.');
        }
        
        // Extract location name from email (e.g., meson@sabanapos.edu.co -> meson)
        const locationName = userEmail.split('@')[0].toLowerCase();
        setPosLocation(locationName);
        
        console.log(`Fetching orders for POS location: ${locationName}`);
          // Query orders that match the location and have status "Confirmed" or "In preparation"
        const ordersQuery = query(
          collection(db, 'orders'),
          where('locationId', '==', locationName),
          where('orderStatus', 'in', ['Confirmed', 'In preparation'])
        );
        
        const querySnapshot = await getDocs(ordersQuery);
        
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          orderTimestamp: doc.data().orderTimestamp?.toDate() || new Date()
        }));
        
        console.log(`Found ${fetchedOrders.length} pending orders for location ${locationName}`);
        setOrders(fetchedOrders);
        
      } catch (err) {
        console.error('Error fetching POS orders:', err);
        setError(err.message);
        if (err.message.includes('Acceso no autorizado')) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosOrders();
  }, [navigate]);  // Handle marking order as "In preparation"
  const handleMarkInPreparation = async (orderId) => {
    try {
      console.log(`Updating order ${orderId} to "In preparation"`);
      await updateOrderStatus(orderId, 'In preparation');
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, orderStatus: 'In preparation' } : order
        )
      );
      
      // Show success notification with checkmark for 1 second
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Error al actualizar el estado del pedido');
    }
  };

  // Handle marking order as "Ready for pickup"
  const handleMarkReady = async (orderId) => {
    try {
      console.log(`Updating order ${orderId} to "Ready for pickup"`);
      await updateOrderStatus(orderId, 'Ready for pickup');
      
      // Show success notification with checkmark for 1 second
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      
      // Remove the order from the list since it's no longer "In preparation" or "Confirmed"
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Error al actualizar el estado del pedido');
    }
  };

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    
    return timestamp.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700">Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#0E2F55] text-white py-2 px-6 rounded-xl hover:bg-[#1a4a80]"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white flex flex-col">      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white bg-opacity-80 rounded-full w-24 h-24 flex items-center justify-center shadow-lg animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1D1981] text-white px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#2d2991] transition-colors"
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-paprika">Pedidos</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-600 text-center">No hay pedidos pendientes en este momento</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-[#CFCFCF] rounded-3xl shadow-md p-4 relative">
                <h2 className="text-xl font-paprika text-[#0F172A] mb-2">
                  Pedido #{order.orderNumber} | {order.orderStatus === 'Confirmed' ? 'Confirmado' : 'En Preparación'}
                </h2>
                
                <p className="text-[#475569] font-paprika text-sm mb-4">
                  {formatTimestamp(order.orderTimestamp)}
                </p>
                
                <div className="bg-white rounded-lg p-3 mb-4">
                  <h3 className="font-semibold text-[#0F172A] mb-2">Detalles del pedido:</h3>
                  <p className="text-[#475569] mb-1"><span className="font-semibold">Restaurante:</span> {order.restaurantName}</p>
                  <p className="text-[#475569] mb-1"><span className="font-semibold">Cliente:</span> {order.userEmail}</p>
                  <p className="text-[#475569] mb-1"><span className="font-semibold">Total:</span> {formatCurrency(order.totalAmount)}</p>
                  <p className="text-[#475569] mb-1"><span className="font-semibold">Método de pago:</span> {order.paymentMethod}</p>
                </div>
                
                <div className="bg-white rounded-lg p-3 mb-4">
                  <h3 className="font-semibold text-[#0F172A] mb-2">Productos:</h3>
                  <ul className="divide-y divide-gray-200">
                    {order.products.map((product, index) => (
                      <li key={index} className="py-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-[#0F172A]">{product.name}</p>
                            <p className="text-sm text-[#475569]">Cantidad: {product.quantity}</p>
                          </div>
                          <p className="text-[#0F172A]">{formatCurrency(product.unitPrice)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                  <div className="flex space-x-4 mt-4">
                  {order.orderStatus === 'Confirmed' && (
                    <button
                      onClick={() => handleMarkInPreparation(order.id)}
                      className="flex-1 bg-[#6C6C6C] border border-[#E2E8F0] text-black py-3 px-4 rounded-xl font-paprika text-sm hover:bg-[#5a5a5a] transition-colors"
                    >
                      En Preparación
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleMarkReady(order.id)}
                    className={`flex-1 bg-[#09EE2B] border border-[#E2E8F0] text-black py-3 px-4 rounded-xl font-paprika text-sm hover:bg-[#07cc25] transition-colors ${order.orderStatus === 'Confirmed' ? 'ml-2' : ''}`}
                  >
                    Listo para Recoger
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <div className="bg-[#3822B4] h-20 rounded-t-3xl shadow-lg">
        <div className="flex justify-between max-w-md mx-auto h-full">
          <div className="flex flex-col items-center justify-center px-4">
            <div className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-white text-xs">Inicio</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <div className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-xs">Pedidos</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <div className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-white text-xs">Inventario</span>
          </div>
        </div>
      </div>
    </div>
  );
}
