import React from 'react';
import lupa from '../../../assets/lupa.png';

export default function SearchBar({ onSearch }) {
  const handleChange = (e) => {
    if (typeof onSearch === 'function') {
      onSearch(e.target.value);
    }
  };
  return (
    <div className="w-full px-3 sm:px-5 pt-[36px] sm:pt-[42px] pb-2 sm:pb-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar productos"
          className="w-full h-[32px] sm:h-[34px] bg-white border border-[#E2E8F0] rounded-[12px] pl-10 sm:pl-12 pr-3 sm:pr-4 font-paprika text-sm sm:text-base text-black placeholder-opacity-25 focus:outline-none focus:ring-1 focus:ring-[#5947FF]"
          onChange={handleChange}
          aria-label="Search products"
        />
        <img
          src={lupa}
          alt=""
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] scale-x-[-1] pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
