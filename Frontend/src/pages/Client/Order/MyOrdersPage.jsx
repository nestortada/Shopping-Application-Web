import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../../../context/OrderContext';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, error, getUserOrders } = useOrderContext();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from local storage
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    
    if (email) {
      getUserOrders(email).catch(console.error);
    }
  }, [getUserOrders]);

  const handleOrderClick = (orderId) => {
    // Navigate to order details page
    navigate(`/client/order/status?id=${orderId}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Convert to date if it's a timestamp
    const date = typeof timestamp === 'object' ? timestamp : new Date(timestamp);
    
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'In preparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ready for pickup':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status translation mapping
  const translateStatus = (status) => {
    switch(status) {
      case 'Confirmed':
        return 'Confirmado';
      case 'In preparation':
        return 'En preparación';
      case 'Ready for pickup':
        return 'Listo para recoger';
      case 'Completed':
        return 'Completado';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
        <h1 className="flex-1 text-center text-xl font-paprika">Mis Pedidos</h1>
      </header>

      {/* Main content */}
      <div className="flex-1 p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600 text-center">No tienes pedidos todavía</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 bg-[#3822B4] text-white py-2 px-4 rounded-lg"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Pedidos</h2>
            
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-gray-800">Pedido #{order.orderNumber}</span>
                    <p className="text-sm text-gray-500">{formatDate(order.orderTimestamp)}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {translateStatus(order.orderStatus)}
                  </span>
                </div>
                
                <div className="text-sm mb-3">
                  <p className="font-medium text-gray-700">{order.restaurantName}</p>
                  <p>{order.products?.length || 0} productos</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-gray-800">${order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bg-[#3822B4] h-20 rounded-t-3xl shadow-lg">
        <div className="flex justify-between max-w-md mx-auto h-full">
          <div className="flex flex-col items-center justify-center px-4">
            <div 
              className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-white text-xs">Restaurantes y cafés</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <div 
              className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
              onClick={() => navigate('/client/orders')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-xs font-bold">Mis pedidos</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <div 
              className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1 cursor-pointer"
              onClick={() => navigate('/promotions')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-2 0v1H5a1 1 0 000 2h2v1a2 2 0 104 0V8h2a1 1 0 100-2h-2V5a1 1 0 10-2 0v1H7z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-xs">Promociones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
