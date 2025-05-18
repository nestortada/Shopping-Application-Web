import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { useCardContext } from '../../context/CardContext';
import { useOrderContext } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { validateOrderAvailability } from '../../services/orderService';
import { ensureCorrectRole } from '../../services/roleService';
import SuccessModal from '../../components/SuccessModal';
import Modal from '../../components/Modal';
import CardModal from '../../components/CardModal';
import BalanceModal from '../../components/BalanceModal';
import Drawer from '../../components/Drawer';
import { successToast, errorToast, warningToast } from '../../utils/toastUtils.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartItemsCount, 
    removeFromCart, 
    updateQuantity,
    getTotalPrice,
    clearCart
  } = useCartContext();
  const { cards, fetchCards, loading: cardsLoading } = useCardContext();
  const { createOrder } = useOrderContext(); // Import createOrder from OrderContext
  const { notifyNewOrder, notifyLowStock } = useNotifications(); // Import notification functions
  const [userRole, setUserRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('saldo');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [installments, setInstallments] = useState(1);
  const [userBalance, setUserBalance] = useState(50000); // Saldo simulado del usuario// Detectar el rol del usuario basado en el dominio de email
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    let locationId = localStorage.getItem('selectedLocationId');
    
    // Si no se encuentra, intentar con la clave 'meson' para Mesón de la Sabana
    if (!locationId) {
      locationId = localStorage.getItem('meson');
      // Si se encuentra 'meson', guardar en 'selectedLocationId' para uso futuro
      if (locationId) {
        localStorage.setItem('selectedLocationId', locationId);
        console.log('useEffect - Encontrado meson, guardado como selectedLocationId:', locationId);
      }
    }
    
    console.log('useEffect - localStorage contents:', { 
      userEmail, 
      selectedLocationId: locationId,
      allKeys: Object.keys(localStorage)
    });
    
    // Si somos un CLIENT y tenemos una ubicación, mostrar en consola
    if (userEmail && userEmail.endsWith('@unisabana.edu.co') && locationId) {
      console.log('Cliente con ubicación seleccionada:', locationId);
    }
    
    if (userEmail) {
      if (userEmail.endsWith('@sabanapos.edu.co')) {
        setUserRole('POS');
        // Verificar que el rol en el token sea correcto
        ensureCorrectRole()
          .then(role => {
            console.log('Rol verificado:', role);
          })
          .catch(error => {
            console.error('Error al verificar el rol:', error);
            setModalTitle('Error de Autenticación');
            setModalMessage('Tu sesión puede haber expirado. Por favor, inicia sesión nuevamente.');
            setIsModalOpen(true);
          });
      } else if (userEmail.endsWith('@unisabana.edu.co')) {
        setUserRole('CLIENT');
      }
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };  // Validar disponibilidad de productos (para usuarios POS)
  const validateProductAvailability = async () => {
    try {
      // Verificar primero el rol del usuario
      try {
        const userRole = await ensureCorrectRole();
        if (userRole !== 'Perfil POS') {
          setModalTitle('Error de Autorización');
          setModalMessage('No tienes permisos para realizar esta acción. Debes tener el rol "Perfil POS".');
          setIsModalOpen(true);
          return;
        }
      } catch (roleError) {
        console.error('Error al verificar el rol:', roleError);
        setModalTitle('Error de Autenticación');
        setModalMessage('No se pudo verificar tu rol. Por favor, inicia sesión nuevamente.');
        setIsModalOpen(true);
        return;
      }

      // Verificar cada producto directamente en Firebase
      const userEmail = localStorage.getItem('userEmail');
      const collectionName = userEmail.split('@')[0];
      
      let allAvailable = true;
      const outOfStockItems = [];
      
      // Verificar disponibilidad en Firebase
      for (const item of cartItems) {
        try {
          const productQuery = query(
            collection(db, collectionName),
            where('id', '==', item.id)
          );
          
          const querySnapshot = await getDocs(productQuery);
          
          if (querySnapshot.empty) {
            console.error(`Producto no encontrado: ${item.name}`);
            outOfStockItems.push(item.name);
            allAvailable = false;
            continue;
          }
          
          const productDoc = querySnapshot.docs[0];
          const productData = productDoc.data();
          
          console.log(`Verificando stock para ${item.name}:`, {
            disponible: productData.stock || 0,
            solicitado: item.quantity
          });
          
          if (!productData.stock || productData.stock < item.quantity) {
            outOfStockItems.push(item.name);
            allAvailable = false;
          }
        } catch (error) {
          console.error(`Error al verificar producto ${item.name}:`, error);
          outOfStockItems.push(item.name);
          allAvailable = false;
        }
      }
      
      if (!allAvailable) {
        setModalTitle('Error');
        setModalMessage(`Ya no hay más disponibles de uno o más productos: ${outOfStockItems.join(', ')}`);
        setIsModalOpen(true);
        return;
      }
        // Si todos los productos están disponibles, actualizar el stock
      for (const item of cartItems) {
        const productQuery = query(
          collection(db, collectionName),
          where('id', '==', item.id)
        );
        
        const querySnapshot = await getDocs(productQuery);
        const productDoc = querySnapshot.docs[0];
        const productRef = doc(db, collectionName, productDoc.id);
        const productData = productDoc.data();
          await updateDoc(productRef, {
          stock: (productData.stock || 0) - item.quantity
        });
      }
      
      // Mostrar el SuccessModal en lugar del modal regular
      setShowSuccessModal(true);
      clearCart();
    } catch (error) {
      console.error('Error al validar disponibilidad:', error);
      setModalTitle('Error');
      setModalMessage('Error al procesar el pedido. Inténtalo de nuevo.');
      setIsModalOpen(true);
    }
  };  // Manejar el click en "Realizar pedido"
  const handleCheckout = () => {
    if (userRole === 'POS') {
      validateProductAvailability();
    } else {
      // Verificar si el ID de ubicación está disponible para usuarios CLIENT
      let locationId = localStorage.getItem('selectedLocationId');
      
      // Si no se encuentra, intentar con la clave 'meson' para Mesón de la Sabana
      if (!locationId) {
        locationId = localStorage.getItem('meson');
        // Si se encuentra 'meson', guardar en 'selectedLocationId' para uso futuro
        if (locationId) {
          localStorage.setItem('selectedLocationId', locationId);
          console.log('handleCheckout - Encontrado meson, guardado como selectedLocationId:', locationId);
        }
      }
      
      console.log('handleCheckout - locationId:', locationId);
      console.log('All localStorage keys:', Object.keys(localStorage));
        if (!locationId && userRole === 'CLIENT') {
        setModalTitle('Selección de Local Requerida');
        setModalMessage('Para continuar con la compra, primero debes seleccionar un local. Por favor, ve a la página de ubicaciones usando el ícono del mapa en la barra inferior y selecciona un local. Una vez seleccionado, regresa al carrito para completar tu compra.');
        setIsModalOpen(true);
        
        // Show warning toast
        warningToast('Selecciona un local antes de realizar tu pedido');
        
        return;
      }
      setIsDrawerOpen(true);
    }
  };
  // Verificar disponibilidad de productos para clientes
  const validateClientProductAvailability = async (locationId) => {
    try {
      console.log('validateClientProductAvailability - locationId:', locationId);
      
      let allAvailable = true;
      const outOfStockItems = [];
      
      // Verificar disponibilidad en Firebase
      for (const item of cartItems) {
        try {
          const productQuery = query(
            collection(db, locationId),
            where('id', '==', item.id)
          );
          
          const querySnapshot = await getDocs(productQuery);
          
          if (querySnapshot.empty) {
            console.error(`Producto no encontrado: ${item.name}`);
            outOfStockItems.push(item.name);
            allAvailable = false;
            continue;
          }
          
          const productDoc = querySnapshot.docs[0];
          const productData = productDoc.data();
          
          console.log(`Verificando stock para ${item.name}:`, {
            disponible: productData.stock || 0,
            solicitado: item.quantity
          });
          
          if (!productData.stock || productData.stock < item.quantity) {
            outOfStockItems.push(item.name);
            allAvailable = false;
          }
        } catch (error) {
          console.error(`Error al verificar producto ${item.name}:`, error);
          outOfStockItems.push(item.name);
          allAvailable = false;
        }
      }
        if (!allAvailable) {
        setModalTitle('Error');
        setModalMessage(`Ya no hay más disponibles de uno o más productos: ${outOfStockItems.join(', ')}`);
        setIsModalOpen(true);
        
        // Show error toast
        errorToast('Algunos productos ya no están disponibles');
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar disponibilidad:', error);
      setModalTitle('Error');
      setModalMessage('Error al procesar el pedido. Inténtalo de nuevo.');
      setIsModalOpen(true);
      return false;
    }
  };  // Actualizar stock después de confirmación de pago para clientes
  const updateProductStock = async (locationId) => {
    try {
      console.log('updateProductStock - locationId:', locationId);
      
      // Si todos los productos están disponibles, actualizar el stock
      for (const item of cartItems) {
        const productQuery = query(
          collection(db, locationId),
          where('id', '==', item.id)
        );
        
        const querySnapshot = await getDocs(productQuery);
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const productRef = doc(db, locationId, productDoc.id);
          const productData = productDoc.data();
          const newStock = (productData.stock || 0) - item.quantity;
          
          await updateDoc(productRef, {
            stock: newStock
          });
          
          // Check if stock is running low (≤ 5)
          if (newStock <= 5) {
            // Notify POS users about low stock
            await notifyLowStock({
              id: item.id,
              nombre: item.name
            }, locationId);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      return false;
    }
  };
  // Validar cupón (simulado)
  const validateCoupon = () => {
    if (couponCode && couponCode.match(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{3}$/i)) {
      setDiscount(2000); // Descuento fijo de 2000 COP
      setCouponApplied(true);
      
      // Show success toast
      successToast('¡Cupón aplicado! Descuento de $2,000 aplicado a tu compra');
    } else {
      setModalTitle('Cupón Inválido');
      setModalMessage('El formato del cupón es incorrecto o no existe.');
      setIsModalOpen(true);
      
      // Show error toast
      errorToast('Cupón inválido');
    }
  };// Finalizar compra desde el drawer (para usuarios CLIENT)
  const handlePayment = async () => {
    if (paymentMethod === 'tarjeta' && !selectedCard) {
      setShowCardModal(true);
      return;
    }
    
    if (paymentMethod === 'saldo') {
      setShowBalanceModal(true);
      return;
    }
    
    // Obtener el ID del local desde localStorage (el usuario debe haber seleccionado un local)
    let locationId = localStorage.getItem('selectedLocationId');
    
    // Si no se encuentra, intentar con la clave 'meson' para Mesón de la Sabana
    if (!locationId) {
      locationId = localStorage.getItem('meson');
      // Si se encuentra 'meson', guardar en 'selectedLocationId' para uso futuro
      if (locationId) {
        localStorage.setItem('selectedLocationId', locationId);
        console.log('handlePayment - Encontrado meson, guardado como selectedLocationId:', locationId);
      }
    }
    
    console.log('handlePayment - locationId:', locationId);
    
    if (!locationId) {
      setIsDrawerOpen(false);
      setModalTitle('Selección de Local Requerida');
      setModalMessage('Para continuar con la compra, primero debes seleccionar un local. Por favor, ve a la página de ubicaciones usando el ícono del mapa en la barra inferior y selecciona un local. Una vez seleccionado, regresa al carrito para completar tu compra.');
      setIsModalOpen(true);
      return;
    }
    
    // Verificar disponibilidad de los productos para el cliente
    const isAvailable = await validateClientProductAvailability(locationId);
    
    if (!isAvailable) {
      return; // El mensaje de error ya se muestra en validateClientProductAvailability
    }
    
    // Actualizar el stock después de confirmar la disponibilidad
    const stockUpdated = await updateProductStock(locationId);
    
    if (!stockUpdated) {
      setIsDrawerOpen(false);
      setModalTitle('Error');
      setModalMessage('Error al actualizar el inventario. Por favor, intenta nuevamente.');
      setIsModalOpen(true);
      return;
    }
      setIsDrawerOpen(false);
    setModalTitle('Éxito');
    setModalMessage('¡Pago realizado con éxito! Tu pedido está en camino.');
    setIsModalOpen(true);
    
    // Show success toast
    successToast('¡Pedido realizado con éxito! Puedes ver el estado de tu pedido en "Mis Pedidos".');
    
    clearCart();
  };  // Manejar continuación desde modal de tarjeta
  const handleCardContinue = async () => {
    setShowCardModal(false);
    
    // Obtener el ID del local desde localStorage
    let locationId = localStorage.getItem('selectedLocationId');
    
    // Si no se encuentra, intentar con la clave 'meson' para Mesón de la Sabana
    if (!locationId) {
      locationId = localStorage.getItem('meson');
      // Si se encuentra 'meson', guardar en 'selectedLocationId' para uso futuro
      if (locationId) {
        localStorage.setItem('selectedLocationId', locationId);
        console.log('handleCardContinue - Encontrado meson, guardado como selectedLocationId:', locationId);
      }
    }
    
    console.log('handleCardContinue - locationId:', locationId);
    
    if (!locationId) {
      setIsDrawerOpen(false);
      setModalTitle('Selección de Local Requerida');
      setModalMessage('Para continuar con la compra, primero debes seleccionar un local. Por favor, ve a la página de ubicaciones usando el ícono del mapa en la barra inferior y selecciona un local. Una vez seleccionado, regresa al carrito para completar tu compra.');
      setIsModalOpen(true);
      return;
    }
    
    // Verificar disponibilidad de los productos para el cliente
    const isAvailable = await validateClientProductAvailability(locationId);
    
    if (!isAvailable) {
      setIsDrawerOpen(false);
      return; // El mensaje de error ya se muestra en validateClientProductAvailability
    }
    
    // Actualizar el stock después de confirmar la disponibilidad
    const stockUpdated = await updateProductStock(locationId);
    
    if (!stockUpdated) {
      setIsDrawerOpen(false);
      setModalTitle('Error');
      setModalMessage('Error al actualizar el inventario. Por favor, intenta nuevamente.');
      setIsModalOpen(true);
      return;
    }
    
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      // Check if the user's email is from @unisabana.edu.co
      if (userEmail && userEmail.endsWith('@unisabana.edu.co')) {
        // Get restaurant name for the order
        let restaurantName = localStorage.getItem('restaurantName') || 'Restaurante';
        
        // Create an order object
        const orderProducts = cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price || 0
        }));
        
        // Calculate pickup time (5-15 minutes from now)
        const now = new Date();
        const minutesToAdd = Math.floor(Math.random() * 11) + 5; // 5 to 15 minutes
        const estimatedPickupTime = new Date(now.getTime() + minutesToAdd * 60000);
        
        // Format time for display
        const formattedTime = estimatedPickupTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        // Generate a unique order number
        const orderNumber = Math.floor(10000 + Math.random() * 90000); // 5-digit number
        
        // Create order data object
        const orderData = {
          orderNumber: orderNumber,
          userEmail: userEmail,
          orderStatus: 'Confirmed',
          orderTimestamp: now,
          estimatedTime: formattedTime,
          restaurantName: restaurantName,
          totalAmount: getTotalPrice() - (couponApplied ? discount : 0),
          paymentMethod: 'tarjeta',
          products: orderProducts,
          locationId: locationId,
          locationName: restaurantName
        };
        
        // Save order to Firestore using imported createOrder function
        try {
          const newOrder = await createOrder(orderData);
          
          // Send notification to POS user
          await notifyNewOrder({
            locationId: locationId,
            locationName: restaurantName,
            orderId: newOrder.id
          });
          
          // Save order data to localStorage for non-context usage
          localStorage.setItem('orderNumber', orderNumber.toString());
          localStorage.setItem('orderStatus', 'Confirmed');
          localStorage.setItem('orderTimestamp', now.toISOString());
          localStorage.setItem('estimatedPickupTime', formattedTime);
          localStorage.setItem('restaurantName', restaurantName);
          localStorage.setItem('totalAmount', getTotalPrice().toString());
          localStorage.setItem('paymentMethod', 'tarjeta');
          localStorage.setItem('currentOrderId', newOrder.id);
          
          // Clear the cart
          clearCart();
          
          // Redirect to the order status page
          navigate('/client/order/status');
        } catch (error) {
          console.error('Error saving order to Firestore:', error);
          setIsDrawerOpen(false);
          setModalTitle('Error');
          setModalMessage('Error al guardar el pedido. Por favor, intenta nuevamente.');
          setIsModalOpen(true);
        }
        return;
      } else {
        // For non-unisabana users, show success modal
        setIsDrawerOpen(false);
        setModalTitle('Éxito');
        setModalMessage('¡Pago realizado con éxito con tarjeta! Tu pedido está en camino.');
        setIsModalOpen(true);
        clearCart();
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setIsDrawerOpen(false);
      setModalTitle('Error');
      setModalMessage('Error al procesar el pedido. Por favor, intenta nuevamente.');
      setIsModalOpen(true);
    }
  };  // Manejar continuación desde modal de saldo
  const handleBalanceContinue = async () => {
    setShowBalanceModal(false);
    
    // Obtener el ID del local desde localStorage
    let locationId = localStorage.getItem('selectedLocationId');
    
    // Si no se encuentra, intentar con la clave 'meson' para Mesón de la Sabana
    if (!locationId) {
      locationId = localStorage.getItem('meson');
      // Si se encuentra 'meson', guardar en 'selectedLocationId' para uso futuro
      if (locationId) {
        localStorage.setItem('selectedLocationId', locationId);
        console.log('handleBalanceContinue - Encontrado meson, guardado como selectedLocationId:', locationId);
      }
    }
    
    console.log('handleBalanceContinue - locationId:', locationId);
    
    if (!locationId) {
      setIsDrawerOpen(false);
      setModalTitle('Selección de Local Requerida');
      setModalMessage('Para continuar con la compra, primero debes seleccionar un local. Por favor, ve a la página de ubicaciones usando el ícono del mapa en la barra inferior y selecciona un local. Una vez seleccionado, regresa al carrito para completar tu compra.');
      setIsModalOpen(true);
      return;
    }
    
    // Verificar disponibilidad de los productos para el cliente
    const isAvailable = await validateClientProductAvailability(locationId);
    
    if (!isAvailable) {
      setIsDrawerOpen(false);
      return; // El mensaje de error ya se muestra en validateClientProductAvailability
    }
    
    // Actualizar el stock después de confirmar la disponibilidad
    const stockUpdated = await updateProductStock(locationId);
    
    if (!stockUpdated) {
      setIsDrawerOpen(false);
      setModalTitle('Error');
      setModalMessage('Error al actualizar el inventario. Por favor, intenta nuevamente.');
      setIsModalOpen(true);
      return;
    }
    
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      // Check if the user's email is from @unisabana.edu.co
      if (userEmail && userEmail.endsWith('@unisabana.edu.co')) {
        // Get restaurant name for the order
        let restaurantName = localStorage.getItem('restaurantName') || 'Restaurante';
        
        // Create an order object
        const orderProducts = cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price || 0
        }));
        
        // Calculate pickup time (5-15 minutes from now)
        const now = new Date();
        const minutesToAdd = Math.floor(Math.random() * 11) + 5; // 5 to 15 minutes
        const estimatedPickupTime = new Date(now.getTime() + minutesToAdd * 60000);
        
        // Format time for display
        const formattedTime = estimatedPickupTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        // Generate a unique order number
        const orderNumber = Math.floor(10000 + Math.random() * 90000); // 5-digit number
        
        // Create order data object
        const orderData = {
          orderNumber: orderNumber,
          userEmail: userEmail,
          orderStatus: 'Confirmed',
          orderTimestamp: now,
          estimatedTime: formattedTime,
          restaurantName: restaurantName,
          totalAmount: getTotalPrice() - (couponApplied ? discount : 0),
          paymentMethod: 'saldo',
          products: orderProducts,
          locationId: locationId,
          locationName: restaurantName
        };
        
        // Save order to Firestore using imported createOrder function
        try {
          const newOrder = await createOrder(orderData);
          
          // Send notification to POS user
          await notifyNewOrder({
            locationId: locationId,
            locationName: restaurantName,
            orderId: newOrder.id
          });
          
          // Save order data to localStorage for non-context usage
          localStorage.setItem('orderNumber', orderNumber.toString());
          localStorage.setItem('orderStatus', 'Confirmed');
          localStorage.setItem('orderTimestamp', now.toISOString());
          localStorage.setItem('estimatedPickupTime', formattedTime);
          localStorage.setItem('restaurantName', restaurantName);
          localStorage.setItem('totalAmount', getTotalPrice().toString());
          localStorage.setItem('paymentMethod', 'saldo');
          localStorage.setItem('currentOrderId', newOrder.id);
          
          // Clear the cart
          clearCart();
          
          // Redirect to the order status page
          navigate('/client/order/status');
        } catch (error) {
          console.error('Error saving order to Firestore:', error);
          setIsDrawerOpen(false);
          setModalTitle('Error');
          setModalMessage('Error al guardar el pedido. Por favor, intenta nuevamente.');
          setIsModalOpen(true);
        }
        return;
      } else {
        // For non-unisabana users, show success modal
        setIsDrawerOpen(false);
        setModalTitle('Éxito');
        setModalMessage('¡Pago realizado con éxito con saldo! Tu pedido está en camino.');
        setIsModalOpen(true);
        clearCart();
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setIsDrawerOpen(false);
      setModalTitle('Error');
      setModalMessage('Error al procesar el pedido. Por favor, intenta nuevamente.');
      setIsModalOpen(true);
    }
  };
  
  // Manejar cambio de método de pago
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'tarjeta') {
      fetchCards();
    }
  };

  // Mostrar mensaje de carrito vacío
  if (cartItemsCount === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
        <header className="bg-[#3822B4] text-white px-4 py-3 flex items-center">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-full hover:bg-[#2d2991] transition-colors"
            aria-label="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-paprika">Mi carrito</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>          <p className="text-gray-600 text-xl font-paprika mb-4">Tu carrito está vacío</p>
          <button
            onClick={() => {
              // Obtener locationId de localStorage
              let locationId = localStorage.getItem('selectedLocationId');
              
              // Si no se encuentra, intentar con la clave 'meson' para Mesón de la Sabana
              if (!locationId) {
                locationId = localStorage.getItem('meson');
                if (locationId) {
                  localStorage.setItem('selectedLocationId', locationId);
                  console.log('CartPage - Botón Continuar Comprando: Encontrado meson, guardado como selectedLocationId:', locationId);
                }
              }
              
              // Navegar a la página de productos con el locationId si está disponible
              if (locationId && locationId !== 'default') {
                console.log('CartPage - Navegando a productos con locationId:', locationId);
                navigate(`/products/${locationId}`);
              } else {
                // Si no hay locationId, ir a la página general de productos
                navigate('/products');
              }
            }}
            className="bg-[#5947FF] text-white font-paprika px-6 py-3 rounded-xl hover:bg-[#4836e0] transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
      <header className="bg-[#3822B4] text-white px-4 py-3 flex items-center">
        <button 
          onClick={handleGoBack}
          className="p-2 rounded-full hover:bg-[#2d2991] transition-colors"
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-paprika">Mi carrito</h1>
      </header>

      <main className="flex-1 max-w-[360px] mx-auto w-full px-4 pt-4 pb-32">
        <div className="bg-white rounded-3xl shadow-lg p-4 mb-4">
          {cartItems.map(item => (
            <div 
              key={item.id} 
              className="flex items-center border-b border-gray-100 py-4 last:border-b-0"
            >
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-[50px] h-[50px] object-cover rounded-lg"
              />
              
              <div className="ml-3 flex-1">
                <h3 className="font-paprika text-[16px] text-[#0F172A]">
                  {item.name}
                </h3>
                <div className="font-paprika text-[14px] text-[#0F172A]">
                  ${item.price.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                
                <span className="font-paprika text-sm w-5 text-center">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label="Eliminar producto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <span className="font-paprika text-gray-600">Subtotal:</span>
            <span className="font-paprika text-[#0F172A]">${getTotalPrice().toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <span className="font-paprika font-bold text-[#0F172A]">Total:</span>
            <span className="font-paprika font-bold text-[#0F172A]">${getTotalPrice().toLocaleString()}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-[360px] mx-auto p-4">
          <button
            onClick={handleCheckout}
            className="w-full bg-[#3822B4] text-white font-paprika py-3 rounded-xl hover:bg-[#4836e0] transition-colors"
          >
            Realizar pedido
          </button>
        </div>
      </div>      {/* Modal para mensajes de éxito o error */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <p className="text-center mb-6">{modalMessage}</p>
        <button
          onClick={() => setIsModalOpen(false)}
          className="w-full bg-[#3822B4] text-white font-paprika py-2 rounded-xl hover:bg-[#4836e0] transition-colors"
        >
          Aceptar
        </button>
      </Modal>

      {/* Modal de tarjetas */}
      <CardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        cards={cards}
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        onContinue={handleCardContinue}
        installments={installments}
        setInstallments={setInstallments}
      />

      {/* Modal de saldo */}
      <BalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        userBalance={userBalance}
        onContinue={handleBalanceContinue}
      />

      {/* Drawer de pago para usuarios CLIENT */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div className="px-5 pb-8">
          <h2 className="text-center text-xl font-paprika mb-6">Finalizar la compra</h2>
          
          {/* Sección de cupón */}
          <div className="mb-6">
            <p className="font-paprika mb-2">Cupón:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="xxxx-xxxx-xxx"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-paprika text-sm"
              />
              <button
                onClick={validateCoupon}
                disabled={couponApplied}
                className={`px-3 py-2 rounded-lg font-paprika text-sm ${
                  couponApplied 
                    ? 'bg-gray-300 text-gray-600' 
                    : 'bg-[#5947FF] text-white hover:bg-[#4836e0]'
                } transition-colors`}
              >
                Validar cupón
              </button>
            </div>
          </div>
          
          {/* Método de pago */}          <div className="mb-6">
            <p className="font-paprika mb-3">Medio de pago</p>
            <div className="flex space-x-3">
              <button
                onClick={() => handlePaymentMethodChange('saldo')}
                className={`flex-1 py-2 rounded-lg font-paprika text-sm ${
                  paymentMethod === 'saldo'
                    ? 'bg-[#5947FF] text-white'
                    : 'bg-gray-100 text-gray-700'
                } transition-colors`}
              >
                Saldo
              </button>
              <button
                onClick={() => handlePaymentMethodChange('tarjeta')}
                className={`flex-1 py-2 rounded-lg font-paprika text-sm ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-[#5947FF] text-white'
                    : 'bg-gray-100 text-gray-700'
                } transition-colors`}
              >
                T. crédito o débito
              </button>
            </div>
          </div>
          
          {/* Detalles del pago */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-paprika font-bold mb-3">Detalles del pago</h3>
            
            <div className="flex justify-between mb-2">
              <span className="font-paprika text-sm">Subtotal:</span>
              <span className="font-paprika text-sm">${getTotalPrice().toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="font-paprika text-sm">Cupón usado:</span>
              <span className="font-paprika text-sm">{couponApplied ? couponCode : 'N/A'}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="font-paprika text-sm">Descuento cupón:</span>
              <span className="font-paprika text-sm">{couponApplied ? `$${discount.toLocaleString()}` : 'N/A'}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="font-paprika text-sm">Medio de pago:</span>
              <span className="font-paprika text-sm">{paymentMethod === 'saldo' ? 'Saldo' : 'Tarjeta'}</span>
            </div>
            
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="font-paprika font-bold">Total para Pagar:</span>
              <span className="font-paprika font-bold">${(getTotalPrice() - (couponApplied ? discount : 0)).toLocaleString()}</span>
            </div>
          </div>
          
          {/* Botón de pago */}          <button
            onClick={handlePayment}
            className="w-full bg-[#3822B4] text-white font-paprika py-3 rounded-xl hover:bg-[#4836e0] transition-colors"
          >
            Pagar
          </button>
        </div>
      </Drawer>
        {/* Modal de éxito para usuarios POS */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSuccessModal(false)} />
          <div
            className="bg-white rounded-lg px-4 pt-5 pb-4 z-10
                     text-left overflow-hidden shadow-xl transform transition-all
                     sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className="sm:flex sm:items-start">
              <div
                className="mx-auto flex-shrink-0 flex items-center justify-center
                         h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  className="h-6 w-6 text-green-600"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  ¡Pedido Exitoso!
                </h3>
                <div className="mt-2">
                  <p className="text-sm leading-5 text-gray-500">
                    El pedido se ha realizado con éxito. Los productos han sido actualizados correctamente en el inventario.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="inline-flex justify-center w-full rounded-md border border-transparent
                         px-4 py-2 bg-[#5947FF] text-base font-medium text-white shadow-sm
                         hover:bg-[#4836e0] focus:outline-none focus:ring-2 focus:ring-offset-2
                         focus:ring-[#5947FF] transition ease-in-out duration-150 sm:ml-3
                         sm:w-auto sm:text-sm font-paprika"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
