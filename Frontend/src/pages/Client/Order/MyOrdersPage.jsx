import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../../../context/OrderContext';
import { useCartContext } from '../../../context/CartContext';
import NotificationBell from '../../../components/NotificationBell';
import { successToast, errorToast } from '../../../utils/toastUtils.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, error, getUserOrders, getPendingOrders } = useOrderContext();
  const { addToCart, clearCart } = useCartContext();
  const [userEmail, setUserEmail] = useState('');
  const [isUnisabanaUser, setIsUnisabanaUser] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const pdfRef = useRef(null);
  
  useEffect(() => {
    // Get user email from local storage
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    
    // Check if user is from Unisabana
    if (email && email.endsWith('@unisabana.edu.co')) {
      setIsUnisabanaUser(true);
    } else {
      // Redirect non-Unisabana users
      navigate('/');
      return;
    }
    
    if (email) {
      // Load orders
      const loadOrders = async () => {
        try {
          const allOrders = await getUserOrders(email);
          
          // Filter pending orders directly
          const pendingOrdersData = allOrders.filter(order => 
            order.orderStatus !== 'Ready for pickup' && 
            order.orderStatus !== 'Completed' &&
            order.orderStatus !== 'Cancelled'
          );
          setPendingOrders(pendingOrdersData);
        } catch (error) {
          console.error("Error loading orders:", error);
          errorToast('Error al cargar tus pedidos');
        }
      };
      
      loadOrders();
    }
  }, [navigate, getUserOrders]);

  // Filter orders based on active tab
  const displayedOrders = activeTab === 'pending' ? pendingOrders : orders;

  // Handle viewing order details
  const handleViewDetails = (order, e) => {
    e.stopPropagation(); // Prevent triggering parent click
    setSelectedOrder(order);
    setViewingDetails(true);
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setViewingDetails(false);
    setSelectedOrder(null);
  };

  // Handle repeat order functionality
  const handleRepeatOrder = async (order, e) => {
    e.stopPropagation(); // Prevent triggering parent click
    
    try {
      // Clear current cart
      clearCart();
      
      // Add each product from the order to the cart
      if (order.products && order.products.length > 0) {
        order.products.forEach(product => {
          // Create a cart item format from the order product
          const cartItem = {
            id: product.id || String(Math.random()), // Fallback if no ID
            name: product.name,
            price: product.unitPrice,
            quantity: product.quantity,
            locationId: order.locationId // Maintain location context
          };
          
          // Add to cart with the specified quantity
          addToCart(cartItem, product.quantity);
        });
        
        // Save location information to localStorage
        localStorage.setItem('locationId', order.locationId);
        
        // Show success message
        successToast('Pedido añadido al carrito', { duration: 3000 });
        
        // Navigate to cart page
        navigate('/cart');
      } else {
        errorToast('No se pudieron cargar los productos del pedido');
      }
    } catch (error) {
      console.error('Error repeating order:', error);
      errorToast('Error al repetir el pedido');
    }
  };

  // Navigate to order status page
  const handleOrderClick = (orderId) => {
    navigate(`/client/order/status?id=${orderId}`);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';
    
    // Convert to date if it's a timestamp
    const date = typeof timestamp === 'object' ? timestamp : new Date(timestamp);
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    
    return date.toLocaleDateString('es-ES', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get status color for styling
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

  // Translate status for display
  const translateStatus = (status) => {
    switch(status) {
      case 'Confirmed':
        return 'Confirmado';
      case 'In preparation':
        return 'En preparación';
      case 'Ready for pickup':
        return 'Listo para recoger';
      case 'Completed':
        return 'Finalizado';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };
  // Handle downloading PDF of order details
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      // Show a loading toast
      const loadingToastId = successToast('Generando PDF...', { 
        duration: 5000,
        type: 'loading'
      });
      
      // Clone the content to avoid modifying the displayed content
      const contentClone = pdfRef.current.cloneNode(true);
      document.body.appendChild(contentClone);
      
      // Set fixed width to ensure proper layout in PDF
      contentClone.style.width = '650px'; 
      contentClone.style.position = 'absolute';
      contentClone.style.left = '-9999px';
      contentClone.style.top = '-9999px';
      
      // Temporarily override all oklch colors with safe colors for html2canvas
      const elementsWithOklchColor = contentClone.querySelectorAll('*');
      elementsWithOklchColor.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        // Apply computed RGB values directly to override any oklch colors
        el.style.color = computedStyle.color;
        el.style.backgroundColor = computedStyle.backgroundColor;
        el.style.borderColor = computedStyle.borderColor;
        
        // Ensure all fonts are rendered properly
        if (computedStyle.fontFamily) {
          el.style.fontFamily = computedStyle.fontFamily;
        }
      });
      
      // Remove any buttons or interactive elements from the PDF
      const buttonsToRemove = contentClone.querySelectorAll('button');
      buttonsToRemove.forEach(button => {
        button.remove();
      });
      
      // Convert to canvas with the modified elements
      const canvas = await html2canvas(contentClone, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false // Disable logging to improve performance
      });
      
      // Remove the clone after capturing
      document.body.removeChild(contentClone);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title to the PDF
      pdf.setFontSize(16);
      pdf.setTextColor(29, 25, 129); // #1D1981
      pdf.text(`Detalles del Pedido #${selectedOrder.orderNumber}`, 105, 15, { align: 'center' });
      
      // Add the image slightly lower to accommodate the title
      pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
      
      // Add footer with date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = new Date();
      pdf.text(`Generado el ${today.toLocaleDateString('es-ES')} ${today.toLocaleTimeString('es-ES')}`, 105, 287, { align: 'center' });
      
      pdf.save(`Pedido-${selectedOrder.orderNumber}.pdf`);
      
      successToast('PDF descargado correctamente', { duration: 3000 });
    } catch (error) {
      console.error('Error descargando PDF:', error);
      errorToast('Error al descargar el PDF');
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
        <h1 className="flex-1 text-center text-xl font-paprika">Todos los pedidos</h1>
        <NotificationBell />
      </header>

      {/* Main content */}
      <div className="flex-1 p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {(!loading && displayedOrders.length === 0) ? (
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
            {displayedOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-[#CFCFCF] rounded-3xl shadow-md p-4 relative"
                onClick={() => handleOrderClick(order.id)}
              >
                <h2 className="text-[#0F172A] text-lg font-paprika">
                  Pedido #{order.orderNumber} | {translateStatus(order.orderStatus)}
                </h2>
                
                <p className="text-[#475569] font-paprika text-sm my-2">
                  {formatDate(order.orderTimestamp)}
                </p>
                
                <div className="flex flex-col space-y-2 mt-2">
                  {/* Repeat Order Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => handleRepeatOrder(order, e)}
                      className="bg-[#EE0909] border border-[#E2E8F0] text-black py-1 px-3 rounded-xl font-paprika text-xs w-[107px]"
                    >
                      Volver a pedir
                    </button>
                  </div>
                  
                  {/* View Details Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => handleViewDetails(order, e)}
                      className="bg-[#09EE2B] border border-[#E2E8F0] text-black py-1 px-3 rounded-xl font-paprika text-xs w-[107px]"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>      {/* Order Details Modal */}
      {viewingDetails && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-md">
            <div className="p-6" ref={pdfRef}>
              {/* Cabecera */}
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-xl font-paprika text-center mx-auto">
                  Pedido #{selectedOrder.orderNumber}
                </h2>
                <button 
                  onClick={handleCloseDetails}
                  className="absolute right-6 top-6 text-gray-500 hover:text-gray-700"
                  aria-label="Cerrar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Sección: Detalles del pedido */}
              <div className="mb-5">
                <h3 className="text-lg font-paprika mb-3">Detalles del pedido</h3>
                <p className="text-xs font-paprika mb-1">Fecha: {formatDate(selectedOrder.orderTimestamp)}</p>
                <p className="text-xs font-paprika mb-1">Estado: {translateStatus(selectedOrder.orderStatus)}</p>
                <p className="text-xs font-paprika">Restaurante: {selectedOrder.restaurantName || selectedOrder.locationName}</p>
              </div>
              
              {/* Sección: Detalles de los productos */}
              <div className="mb-5">
                <h3 className="text-lg font-paprika mb-3">Detalles de los productos</h3>
                <ul className="divide-y divide-gray-200">
                  {selectedOrder.products?.map((product, index) => (
                    <li key={index} className="py-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-paprika">{product.name} {product.quantity > 1 ? `(${product.quantity})` : ''}</p>
                        <p className="text-xs font-paprika">{formatCurrency(product.unitPrice * product.quantity)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Sección: Detalles del pago */}
              <div className="mb-5">
                <h3 className="text-lg font-paprika mb-3">Detalles del pago</h3>
                <p className="text-xs font-paprika mb-1">Subtotal: {formatCurrency(selectedOrder.totalAmount)}</p>
                <p className="text-xs font-paprika mb-1">Cupón usado: {selectedOrder.couponCode || 'N/A'}</p>
                <p className="text-xs font-paprika mb-1">Descuento cupón: {selectedOrder.discount ? formatCurrency(selectedOrder.discount) : 'N/A'}</p>
                <p className="text-xs font-paprika mb-1">Total pagado: {formatCurrency(selectedOrder.totalAmount - (selectedOrder.discount || 0))}</p>
                <p className="text-xs font-paprika">Medio de pago: {selectedOrder.paymentMethod || 'N/A'}</p>
              </div>
              
              {/* Botones */}
              <div className="mt-8 flex space-x-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-blue-500 text-white border border-transparent rounded-xl px-4 py-2 text-sm font-paprika flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar PDF
                </button>
                <button
                  onClick={(e) => {
                    handleRepeatOrder(selectedOrder, e);
                    handleCloseDetails();
                  }}
                  className="flex-1 bg-[#EE0909] text-black border border-transparent rounded-xl px-4 py-2 text-sm font-paprika"
                >
                  Volver a pedir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
