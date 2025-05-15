import React from 'react';

const categories = ['All', 'Hot Drinks', 'Cold Drinks', 'Food', 'Snacks'];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="flex gap-1 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#5947FF] scrollbar-track-transparent">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`
            px-4 py-2 rounded-xl border border-[#E2E8F0] whitespace-nowrap
            font-paprika text-xs
            ${selectedCategory === category 
              ? 'bg-[#5947FF] text-white' 
              : 'bg-white text-black opacity-25'}
          `}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
