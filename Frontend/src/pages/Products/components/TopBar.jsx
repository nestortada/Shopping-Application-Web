import React from 'react';
import { Link } from 'react-router-dom';
import perfil from '../../../assets/usuario.png';
import ubicaciones from '../../../assets/marcador-de-posicion.png';
import carrito from '../../../assets/carrito.png';
import NotificationBell from '../../../components/NotificationBell';

export default function TopBar({ isCustomer, cartItemsCount = 0, locationTitle = '', onProfileClick }) {
  return (
    <nav className="w-full h-[55px] bg-[#3822B4] flex items-center justify-between px-2">
      <div className="flex items-center">
        <button onClick={onProfileClick} aria-label="Profile" className="p-0 bg-transparent border-0">
          <img src={perfil} alt="Profile" className="w-[33px] h-[33px]" />
        </button>
        {isCustomer && (
          <Link to="/map" aria-label="Select location">
            <img src={ubicaciones} alt="Location" className="w-[34px] h-[34px] ml-1" />
          </Link>
        )}
        {locationTitle && (
          <span className="text-white ml-2 font-paprika text-sm truncate max-w-[180px]">
            {locationTitle}
          </span>
        )}      </div>
      
      <div className="flex items-center">
        <NotificationBell />
        <Link to="/cart" aria-label="Shopping cart" className="relative ml-2">
          <img src={carrito} alt="Cart" className="w-[35px] h-[35px]" />
          {cartItemsCount > 0 && (
            <div className="absolute top-[-4px] right-[-4px] w-[18px] h-[19px] bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
              {cartItemsCount}
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
}
