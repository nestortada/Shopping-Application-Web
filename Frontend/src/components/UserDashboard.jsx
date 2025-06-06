import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/authService'; // Asegúrate de que esta función esté configurada correctamente
import { useOrderContext } from '../context/OrderContext';
import Button from './Button';
import profileIcon from '../assets/usuario.png';
import logoutIcon from '../assets/logout.png';

export default function UserDashboard({ onClose }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'pending'
  const navigate = useNavigate();
  
  // Attempt to use OrderContext only if component is mounted within the provider
  let orderContext;
  try {
    orderContext = useOrderContext();
  } catch (e) {
    console.warn('OrderContext not available. Some functionality will be disabled.');
    orderContext = { getUserOrders: () => Promise.resolve([]) };
  }
  
  // Safely extract getUserOrders function from context
  const getUserOrders = orderContext?.getUserOrders || (() => Promise.resolve([]));
    useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/', { replace: true });
          return;
        }

        const profile = await getUserProfile(token);
        setUser(profile);
        
        // Check if user is from Unisabana
        if (profile && profile.email && profile.email.endsWith('@unisabana.edu.co')) {
          // Fetch pending orders for Unisabana users
          fetchPendingOrders(profile.email);
        }
      } catch (err) {
        setError('Error al cargar el perfil: ' + err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [navigate]);  // Function to fetch pending orders
  const fetchPendingOrders = async (email) => {
    if (!email || typeof getUserOrders !== 'function') {
      console.log("Cannot fetch orders: No email provided or getUserOrders not available");
      return;
    }
    
    try {
      console.log("Fetching orders for:", email);
      const allOrders = await getUserOrders(email);
      
      if (!Array.isArray(allOrders)) {
        console.warn('getUserOrders did not return an array', allOrders);
        return;
      }
      
      console.log("Orders fetched:", allOrders.length);
      
      // Filter pending orders (not 'Ready for pickup' or 'Completed')
      const pending = allOrders.filter(order => 
        order.orderStatus !== 'Ready for pickup' && 
        order.orderStatus !== 'Completed' &&
        order.orderStatus !== 'Cancelled'
      );
      
      console.log("Pending orders:", pending.length);
      setPendingOrders(pending);
      
      // Show pending orders section if there are any
      if (pending.length > 0) {
        setShowPendingOrders(true);
      } else {
        setShowPendingOrders(false);
      }
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      // Don't set error state - just log to console to avoid breaking the UI
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
    onClose();
  };

  const handleNavigation = (route) => {
    if (route) {
      navigate(route);
      onClose();
    }
  };
  
  const handleOrderClick = (orderId) => {
    // Navigate to order details page
    navigate(`/client/order/status?id=${orderId}`);
    onClose();
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
  
  // Function to translate order status to Spanish
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
  const getUsernameFromEmail = (email) => {
    return email ? email.split('@')[0] : '';
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(balance || 0);
  };
  // Add special items for different user types
  const isUnisabanaUser = user?.email?.endsWith('@unisabana.edu.co');
  const isSabanaposUser = user?.email?.endsWith('@sabanapos.edu.co');
  
  // Menu items based on user type
  let menuItems = [];
  
  if (isSabanaposUser) {
    // Menu for POS users
    menuItems = [
      { id: 'password', label: 'Cambiar contraseña', route: '/forgot' },
      { id: 'inventory', label: 'Inventario', route: '/inventory' },
      { id: 'ratings', label: 'Mis calificaciones', route: '/ratings' },
      { id: 'order-status', label: 'Estado de Pedidos', route: '/pos/orders' }
    ];
  } else if (user?.role === 'Perfil POS') {
    // Legacy menu for POS role users
    menuItems = [
      { id: 'password', label: 'Cambiar contraseña', route: '/forgot' },
      { id: 'inventory', label: 'Inventario', route: '/inventory' },
      { id: 'ratings', label: 'Mis calificaciones', route: '/ratings' },
      { id: 'orders', label: 'Estados de pedido', route: '/orders' }
    ];
  } else {
    // Regular user menu
    menuItems = [
      { id: 'password', label: 'Cambiar contraseña', route: '/forgot' },
      { id: 'cards', label: 'Mis tarjetas', route: '/cards' },
      { id: 'balance', label: 'Recargar saldo', route: '/balance' },
      { id: 'favorites', label: 'Mis favoritos', route: '/favorites' },
      { id: 'ratings', label: 'Mis calificaciones', route: '/ratings' }
    ];
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg border border-red-300">
        <p className="font-semibold">Error al cargar el perfil</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 mb-4">No se pudo cargar el perfil</p>
        <Button
          text="Volver al inicio"
          color="bg-blue-600"
          onClick={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#3F2EDA] text-white p-6">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:opacity-75 transition-opacity"
        aria-label="Cerrar"
      >
        ✕
      </button>

      {/* User Profile */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <img
            src={profileIcon}
            alt="Foto de perfil"
            className="w-20 h-20 rounded-full mb-4 bg-white p-2"
          />
          <div className="absolute bottom-4 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-white"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          {getUsernameFromEmail(user.email)}
        </h2>
        <p className="text-sm opacity-90 mb-4">{user.email}</p>
        <p className="text-lg font-bold">
          Saldo: {formatBalance(user.balance)}
        </p>
      </div>      {/* Menu Items */}
      <nav className="flex-1">
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.route)}
                className="w-full py-3 px-4 bg-[#2C1DBA] hover:bg-[#251796] text-white rounded-lg text-center font-paprika text-base transition-colors flex items-center justify-center"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Tabs for Profile and Pending Orders */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'profile' ? 'bg-[#2C1DBA] text-white' : 'bg-transparent text-[#D1D5DB]'
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'pending' ? 'bg-[#2C1DBA] text-white' : 'bg-transparent text-[#D1D5DB]'
          }`}
        >
          Pendientes
        </button>
      </div>

      {/* Pending Orders Section for Unisabana Users */}
      {isUnisabanaUser && activeTab === 'pending' && showPendingOrders && pendingOrders.length > 0 && (
        <div className="mt-6 bg-[#2C1DBA] p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Pedidos Pendientes</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {pendingOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="bg-[#3F2EDA] hover:bg-[#4A38E2] p-3 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-white font-semibold">#{order.orderNumber}</span>
                    <p className="text-white text-sm">{order.restaurantName}</p>
                  </div>
                  <span className="text-xs bg-white text-[#3F2EDA] px-2 py-1 rounded-full font-medium">
                    {translateStatus(order.orderStatus)}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-white text-xs">
                    <span className="opacity-75">Hora estimada:</span> {order.estimatedTime || 'No disponible'}
                  </p>
                  <p className="text-white text-sm font-semibold mt-1">
                    Total: ${order.totalAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full py-3 px-4 bg-[#2C1DBA] hover:bg-[#251796] text-white rounded-lg text-center font-paprika text-base transition-colors flex items-center justify-center"
      >
        <img 
          src={logoutIcon} 
          alt="" 
          className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" 
        />
        Cerrar sesión
      </button>
    </div>
  );
}