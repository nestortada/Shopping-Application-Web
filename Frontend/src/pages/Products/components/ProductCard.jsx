import React, { useState } from 'react';
import { useCartContext } from '../../../context/CartContext';

export default function ProductCard({ product }) {
  const { name, description, price, imageUrl } = product;
  const { addToCart } = useCartContext();
  const [showDetails, setShowDetails] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Basic card (collapsed)
  if (!showDetails) {
    return (
      <article 
        className="w-[351px] h-[78px] bg-[#CFCFCF] shadow-md rounded-[24px] flex items-center p-4 mb-4 cursor-pointer hover:bg-gray-300 transition-colors"
        onClick={toggleDetails}
      >
        <img 
          src={imageUrl} 
          alt={name}
          className="w-[62px] h-[62px] object-cover rounded-lg"
        />
        <div className="ml-4 flex-1">
          <h3 className="font-paprika text-[18px] text-[#0F172A]">
            {name}
          </h3>
          <p className="font-paprika text-[14px] text-[#475569] line-clamp-1">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="font-paprika text-[16px] text-[#0F172A] mb-1">
            ${price.toLocaleString()}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="bg-[#5947FF] text-white font-paprika text-xs px-2 py-1 rounded-full hover:bg-[#4836e0] transition-colors"
            aria-label="Add to cart"
          >
            + Add
          </button>
        </div>
      </article>
    );
  }

  // Expanded card (with details)
  return (
    <article className="w-[351px] bg-[#CFCFCF] shadow-md rounded-[24px] p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-[62px] h-[62px] object-cover rounded-lg"
          />
          <div className="ml-4">
            <h3 className="font-paprika text-[18px] text-[#0F172A]">
              {name}
            </h3>
            <div className="font-paprika text-[16px] text-[#0F172A]">
              ${price.toLocaleString()}
            </div>
          </div>
        </div>
        <button 
          onClick={toggleDetails}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="mt-3">
        <p className="font-paprika text-[14px] text-[#475569]">
          {description}
        </p>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleAddToCart}
          className="bg-[#5947FF] text-white font-paprika text-sm px-4 py-2 rounded-xl hover:bg-[#4836e0] transition-colors w-full"
          aria-label="Add to cart"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
