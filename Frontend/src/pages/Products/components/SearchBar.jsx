import React from 'react';
import lupa from '../../../assets/lupa.png';

export default function SearchBar({ onSearch }) {
  const handleChange = (e) => {
    if (typeof onSearch === 'function') {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="w-full px-5 pt-[42px] pb-3">
      <div className="relative">        <input
          type="text"
          placeholder="Search"
          className="w-full h-[34px] bg-white border border-[#E2E8F0] rounded-[12px] pl-12 pr-4 font-paprika text-base text-black placeholder-opacity-25"
          onChange={handleChange}
          aria-label="Search products"
        />
        <img
          src={lupa}
          alt="Search"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-[36px] h-[36px] scale-x-[-1]"
        />
      </div>
    </div>
  );
}
