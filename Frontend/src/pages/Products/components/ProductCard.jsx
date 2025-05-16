import React, { useState } from 'react';

export default function ProductCard({ product }) {
  const { name, description, price, imageUrl } = product;
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  // Basic card (collapsed)
  if (!showDetails) {
    return (
      <article 
        className="w-full max-w-[351px] mx-auto h-auto min-h-[78px] bg-[#CFCFCF] shadow-md rounded-[24px] flex flex-wrap sm:flex-nowrap items-center p-3 sm:p-4 mb-4 cursor-pointer hover:bg-gray-300 transition-colors"
        onClick={toggleDetails}
      >
        <img 
          src={imageUrl || `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`}
          alt={name}
          className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] object-cover rounded-lg flex-shrink-0"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`;
          }}
        />
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <h3 className="font-paprika text-[16px] sm:text-[18px] text-[#0F172A] truncate">
            {name}
          </h3>
          <p className="font-paprika text-[12px] sm:text-[14px] text-[#475569] line-clamp-1">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-end ml-2 flex-shrink-0">
          <div className="font-paprika text-[14px] sm:text-[16px] text-[#0F172A]">
            ${price.toLocaleString()}
          </div>
        </div>
      </article>
    );
  }  // Expanded card (with details)
  return (
    <article className="w-full max-w-[351px] mx-auto bg-[#CFCFCF] shadow-md rounded-[24px] p-3 sm:p-4 mb-4">
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-start">
        <div className="flex w-full sm:w-auto items-start">
          <img 
            src={imageUrl || `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`}
            alt={name}
            className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] object-cover rounded-lg flex-shrink-0"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`;
            }}
          />
          <div className="ml-3 sm:ml-4 flex-1 min-w-0">
            <h3 className="font-paprika text-[16px] sm:text-[18px] text-[#0F172A] pr-8 sm:pr-0">
              {name}
            </h3>
            <div className="font-paprika text-[14px] sm:text-[16px] text-[#0F172A]">
              ${price.toLocaleString()}
            </div>
          </div>
        </div>
        <button 
          onClick={toggleDetails}
          className="text-gray-500 hover:text-gray-700 absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto"
          aria-label="Close details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="mt-3">
        <p className="font-paprika text-[12px] sm:text-[14px] text-[#475569]">
          {description}
        </p>
        {product.ingredientes && (
          <div className="mt-2">
            <h4 className="font-paprika text-[12px] sm:text-[14px] text-[#0F172A] font-semibold">Ingredientes:</h4>
            <p className="font-paprika text-[12px] sm:text-[14px] text-[#475569]">
              {product.ingredientes}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
