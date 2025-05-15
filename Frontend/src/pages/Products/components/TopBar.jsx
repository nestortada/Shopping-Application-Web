import React from 'react';
import { Link } from 'react-router-dom';
import perfil from '../../../assets/usuario.png';
import ubicaciones from '../../../assets/marcador-de-posicion.png';
import carrito from '../../../assets/carrito.png';

export default function TopBar({ isCustomer, cartItemsCount = 0, locationTitle = '' }) {
  return (
    <nav className="w-full h-[41px] bg-[#1D1981] flex items-center justify-between px-2">
      <div className="flex items-center">
        <Link to="/profile" aria-label="Profile">
          <img src={perfil} alt="Profile" className="w-[33px] h-[33px]" />
        </Link>
        {isCustomer && (
          <Link to="/map" aria-label="Select location">
            <img src={ubicaciones} alt="Location" className="w-[34px] h-[34px] ml-1" />
          </Link>
        )}
        {locationTitle && (
          <span className="text-white ml-2 font-paprika text-sm truncate max-w-[180px]">
            {locationTitle}
          </span>
        )}
      </div>
      
      <Link to="/cart" aria-label="Shopping cart" className="relative">
        <img src={carrito} alt="Cart" className="w-[35px] h-[35px]" />
        {cartItemsCount > 0 && (
          <div className="absolute top-[-4px] right-[-4px] w-[18px] h-[19px] bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
            {cartItemsCount}
          </div>
        )}
      </Link>
    </nav>
  );
}
