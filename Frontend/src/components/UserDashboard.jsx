import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/authService'; // Asegúrate de que esta función esté configurada correctamente
import Button from './Button';
import profileIcon from '../assets/usuario.png';
import logoutIcon from '../assets/logout.png';

export default function UserDashboard({ onClose }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/', { replace: true });
          return;
        }

        const profile = await getUserProfile(token); // Se pasa el token aquí
        setUser(profile);
      } catch (err) {
        setError('Error al cargar el perfil: ' + err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [navigate]);

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

  const menuItems = user?.role === 'Perfil POS' 
    ? [
        { id: 'password', label: 'Cambiar contraseña', route: '/forgot' },
        { id: 'inventory', label: 'Inventario', route: '/inventory' },
        { id: 'ratings', label: 'Mis calificaciones', route: '/ratings' },
        { id: 'orders', label: 'Estados de pedido', route: '/orders' }
      ]
    : [
        { id: 'password', label: 'Cambiar contraseña', route: '/forgot' },
        { id: 'cards', label: 'Mis tarjetas', route: '/cards' },
        { id: 'balance', label: 'Recargar saldo', route: '/balance' },
        { id: 'favorites', label: 'Mis favoritos', route: '/favorites' },
        { id: 'ratings', label: 'Mis calificaciones', route: '/ratings' }
      ];

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg border border-red-300">
        <p className="font-semibold">Error al cargar el perfil:</p>
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
      </div>

      {/* Menu Items */}
      <nav className="flex-1">
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                text={item.label}
                color="bg-[#2C1DBA] hover:bg-[#251796]"
                onClick={() => handleNavigation(item.route)}
                className="w-full justify-start px-4 group"
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 flex items-center justify-center w-full bg-[#2C1DBA] hover:bg-[#251796] text-white py-3 px-4 rounded-lg transition-colors group"
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
