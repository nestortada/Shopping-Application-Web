import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import casaIcon from '../../../assets/casa.png';
import pedidoIcon from '../../../assets/pedido.png';
import promocionesIcon from '../../../assets/promociones.png';
import ubicacionesIcon from '../../../assets/marcador-de-posicion.png';

export default function BottomNavWithMap({ active = 'home', isCustomer = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRestaurant, setCurrentRestaurant] = useState('');

  // Extract the current restaurant name from the URL
  useEffect(() => {
    const urlParts = location.pathname.split('/').filter(Boolean);
    let restaurantName = '';
    
    if (urlParts.length >= 2) {
      if (urlParts[0] === 'products') {
        // URL format: /products/[restaurantName]
        restaurantName = urlParts[1];
      } else if (urlParts[0] === 'food' && urlParts.length >= 3) {
        // URL format: /food/[restaurantName]/[productId]
        restaurantName = urlParts[1];
      }
    }
    
    setCurrentRestaurant(restaurantName);
  }, [location.pathname]);

  // Handler for restaurant button, similar to "Add to cart" in FoodPage
  const handleRestaurantClick = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Store the intended redirect location
      localStorage.setItem('redirectAfterLogin', '/products');
      // Redirect to login
      navigate('/');
      return;
    }
    
    // Navigate to restaurant products page if we have a restaurant name
    if (currentRestaurant) {
      navigate(`/products/${currentRestaurant}`);
    } else {
      // Default to main products page if no restaurant is in context
      navigate('/products');
    }
  };
  
  // Base items always shown
  const baseItems = [
    { 
      id: 'home', 
      label: 'Restaurantes', 
      icon: casaIcon, 
      onClick: handleRestaurantClick, 
      iconComponent: null 
    },    { 
      id: 'orders', 
      label: 'Mis pedidos', 
      icon: pedidoIcon, 
      path: '/client/orders', 
      iconComponent: null 
    },
  ];

  // Add additional items for customers
  const customerItems = [
    { 
      id: 'favorites', 
      label: 'Favoritos', 
      icon: null, 
      path: '/favorites', 
      iconComponent: FaHeart 
    },
    { 
      id: 'map', 
      label: 'Mapa', 
      icon: ubicacionesIcon, 
      path: '/map', 
      iconComponent: null 
    }
  ];

  // For non-customers (POS), show promotions
  const posItems = [
    { 
      id: 'promotions', 
      label: 'Promociones', 
      icon: promocionesIcon, 
      path: '/promotions', 
      iconComponent: null 
    },
  ];

  // Add appropriate items based on user type
  const items = isCustomer 
    ? [...baseItems, ...customerItems]
    : [...baseItems, ...posItems];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[83px] bg-[#3822B4] flex justify-around items-center">
      {items.map(({ id, label, icon, path, onClick, iconComponent: IconComponent }) => {
        // Create either a Link or a button based on whether onClick is provided
        const NavItem = onClick ? (
          <button 
            key={id} 
            onClick={onClick}
            className="flex flex-col items-center focus:outline-none"
            aria-label={label}
          >
            <span className={`
              w-[50px] h-[50px] rounded-full flex items-center justify-center
              ${active === id ? 'bg-[#7A5EF6]' : 'bg-[#7A5EF6]/80'}
            `}>
              {IconComponent ? (
                <IconComponent className="w-6 h-6 text-white" />
              ) : (
                <img src={icon} alt="" className="w-6 h-6" />
              )}
            </span>
            <span className="mt-1 text-[10px] font-paprika text-white">{label}</span>
          </button>
        ) : (
          <Link 
            to={path} 
            key={id} 
            className="flex flex-col items-center focus:outline-none"
            aria-label={label}
          >
            <span className={`
              w-[50px] h-[50px] rounded-full flex items-center justify-center
              ${active === id ? 'bg-[#7A5EF6]' : 'bg-[#7A5EF6]/80'}
            `}>
              {IconComponent ? (
                <IconComponent className="w-6 h-6 text-white" />
              ) : (
                <img src={icon} alt="" className="w-6 h-6" />
              )}
            </span>
            <span className="mt-1 text-[10px] font-paprika text-white">{label}</span>
          </Link>
        );
        
        return NavItem;
      })}
    </nav>
  );
}
