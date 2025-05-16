import React from 'react';

const categories = ['All', 'Bebida Caliente', 'Bebida Fría', 'Pollo', 'Carne', 'Hamburguesas'];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {  return (
    <div 
      className="flex gap-1 mt-3 sm:mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#5947FF] scrollbar-track-transparent" 
      role="tablist"
      aria-label="Product Categories"
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          role="tab"
          aria-selected={selectedCategory === category}
          aria-controls="product-list"
          className={`
            px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#E2E8F0] whitespace-nowrap
            font-paprika text-xs sm:text-sm flex-shrink-0 touch-manipulation
            ${selectedCategory === category 
              ? 'bg-[#5947FF] text-white border-[#5947FF]' 
              : 'bg-white text-black opacity-25 hover:opacity-40 focus:opacity-40'}
          `}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
