import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import casaIcon from '../../../assets/casa.png';
import pedidoIcon from '../../../assets/pedido.png';
import promocionesIcon from '../../../assets/promociones.png';
import ubicacionesIcon from '../../../assets/marcador-de-posicion.png';

export default function BottomNavWithMap({ active = 'home', isCustomer = true }) {
  // Base items always shown
  const baseItems = [
    { id: 'home', label: 'Restaurantes', icon: casaIcon, path: '/productos', iconComponent: null },
    { id: 'orders', label: 'Mis pedidos', icon: pedidoIcon, path: '/orders', iconComponent: null },
  ];

  // Add additional items for customers
  const customerItems = [
    { id: 'favorites', label: 'Favoritos', icon: null, path: '/favorites', iconComponent: FaHeart },
    { id: 'map', label: 'Mapa', icon: ubicacionesIcon, path: '/map', iconComponent: null }
  ];

  // For non-customers (POS), show promotions
  const posItems = [
    { id: 'promotions', label: 'Promociones', icon: promocionesIcon, path: '/promotions', iconComponent: null },
  ];

  // Add appropriate items based on user type
  const items = isCustomer 
    ? [...baseItems, ...customerItems]
    : [...baseItems, ...posItems];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[83px] bg-[#3822B4] flex justify-around items-center">
      {items.map(({ id, label, icon, path, iconComponent: IconComponent }) => (
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
      ))}
    </nav>
  );
}
