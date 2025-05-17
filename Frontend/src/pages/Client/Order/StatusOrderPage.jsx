import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrderContext } from '../../../context/OrderContext';

export default function StatusOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrder, loading, error, getOrderById } = useOrderContext();
  const [orderStatus, setOrderStatus] = useState('Confirmed'); // Default status
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [restaurantName, setRestaurantName] = useState('');

  // Steps for the order process
  const steps = [
    { label: 'Pedido confirmado', value: 'Confirmed' },
    { label: 'En preparación', value: 'In preparation' },
    { label: 'Listo para recoger', value: 'Ready for pickup' }
  ];

  // Get the order ID from the URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('id');
    
    if (orderId) {
      console.log("Fetching order by ID:", orderId);
      getOrderById(orderId).catch(err => {
        console.error("Error fetching order by ID:", err);
      });
    }
  }, [location.search, getOrderById]);

  // Update UI when current order changes
  useEffect(() => {
    if (currentOrder) {
      console.log("Current order updated:", currentOrder);
      setOrderStatus(currentOrder.orderStatus);
      setEstimatedPickupTime(currentOrder.estimatedTime);
      setRestaurantName(currentOrder.restaurantName);
      
      // Set the current step based on status
      const stepIndex = steps.findIndex(step => step.value === currentOrder.orderStatus);
      setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
    } else {
      console.log("No current order, using localStorage");
      // If no order in context, try to get from localStorage
      const orderStatus = localStorage.getItem('orderStatus');
      const estimatedTime = localStorage.getItem('estimatedPickupTime');
      const restaurant = localStorage.getItem('restaurantName');
      
      if (orderStatus) setOrderStatus(orderStatus);
      if (estimatedTime) setEstimatedPickupTime(estimatedTime);
      if (restaurant) setRestaurantName(restaurant);
      
      // Determine step from localStorage status
      if (orderStatus) {
        const stepIndex = steps.findIndex(step => step.value === orderStatus);
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
      }
    }
  }, [currentOrder, steps]);

  const handleBackToHome = () => {
    // Get the location ID from localStorage
    const locationId = localStorage.getItem('locationId');
    // Navigate to products page with the location ID
    navigate(`/products/${locationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700">Cargando estado del pedido...</p>
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
          onClick={handleBackToHome}
          className="bg-[#0E2F55] text-white py-2 px-6 rounded-xl hover:bg-[#1a4a80]"
        >
          Volver al inicio
        </button>
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
        <h1 className="flex-1 text-center text-xl font-paprika">Estado del Pedido</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-6">
        {/* Order confirmation illustration */}
        <div className="w-full max-w-md bg-blue-50 rounded-lg p-8 mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Confirmado!</h2>
          <p className="text-gray-600 text-center">
            Tu pedido ha sido recibido y está siendo procesado.
          </p>
          
          {currentOrder && (
            <div className="mt-4 text-gray-700">
              <p><span className="font-semibold">Número de Pedido:</span> #{currentOrder.orderNumber}</p>
              <p><span className="font-semibold">Restaurante:</span> {restaurantName}</p>
            </div>
          )}
          
          <div className="mt-4 bg-white p-4 rounded-lg w-full">
            <p className="font-bold text-gray-800">Hora estimada de entrega:</p>
            <p className="text-xl text-blue-600">{estimatedPickupTime}</p>
          </div>
        </div>

        {/* Status progress */}
        <div className="w-full max-w-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Estado del pedido</h3>
          
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 h-full w-0.5 bg-gray-200" style={{ height: 'calc(100% - 40px)' }}></div>
            
            {/* Steps */}
            {steps.map((step, index) => (
              <div key={index} className="flex items-start mb-8 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  index <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className={`font-medium ${index <= currentStep ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.label}
                  </h4>
                  {index === 0 && (
                    <p className="text-sm text-gray-500">Tu pedido ha sido confirmado.</p>
                  )}
                  {index === 1 && (
                    <p className="text-sm text-gray-500">El restaurante está preparando tu pedido.</p>
                  )}
                  {index === 2 && (
                    <p className="text-sm text-gray-500">¡Tu pedido está listo para recoger!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return button */}
        <button 
          onClick={handleBackToHome}
          className="bg-[#0E2F55] text-white py-2 px-6 rounded-xl hover:bg-[#1a4a80] w-full max-w-md"
        >
          Volver al inicio
        </button>
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
            <span className="text-white text-xs">Restaurantes y cafés</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <div className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-xs">Mis pedidos</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <div className="bg-[#7A5EF6] rounded-full w-12 h-12 flex items-center justify-center mb-1">
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
