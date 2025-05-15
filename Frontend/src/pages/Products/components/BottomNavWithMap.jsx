import React from 'react';
import { Link } from 'react-router-dom';
import casaIcon from '../../../assets/casa.png';
import pedidoIcon from '../../../assets/pedido.png';
import promocionesIcon from '../../../assets/promociones.png';
import ubicacionesIcon from '../../../assets/marcador-de-posicion.png';

export default function BottomNavWithMap({ active = 'home', isCustomer = true }) {
  // Base items always shown
  const baseItems = [
    { id: 'home', label: 'Restaurantes', icon: casaIcon, path: '/productos' },
    { id: 'orders', label: 'Mis pedidos', icon: pedidoIcon, path: '/orders' },
    { id: 'promotions', label: 'Promociones', icon: promocionesIcon, path: '/promotions' },
  ];

  // Add map item only for customers
  const items = isCustomer 
    ? [...baseItems, { id: 'map', label: 'Mapa', icon: ubicacionesIcon, path: '/map' }]
    : baseItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[83px] bg-[#3822B4] flex justify-around items-center">
      {items.map(({ id, label, icon, path }) => (
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
            <img src={icon} alt="" className="w-6 h-6" />
          </span>
          <span className="mt-1 text-[10px] font-paprika text-white">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
