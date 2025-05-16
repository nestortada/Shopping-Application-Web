import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';

export default function ProductList({ products, category, onSelectCategory, locationId }) {
  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(product => product.categoria === category || product.category === category);
    
  return (
    <div className="space-y-3 sm:space-y-4 w-full" id="product-list">
      {filteredProducts.length > 0 ? (
        <ul className="list-none p-0 space-y-3 sm:space-y-4 w-full">
          {filteredProducts.map(product => (
            <li key={product.id} className="w-full flex justify-center">
              <ProductCard product={product} locationId={locationId} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8">
          <p className="text-center text-gray-500 font-paprika text-sm sm:text-base" aria-live="polite">
            {products.length ? 'No hay productos en esta categoría' : 'No hay productos disponibles'}
          </p>
          {products.length > 0 && (
            <button 
              onClick={() => category !== 'All' && onSelectCategory('All')}
              className="mt-3 text-[#5947FF] underline text-sm"
            >
              Ver todos los productos
            </button>
          )}
        </div>
      )}    </div>
  );
}

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
  category: PropTypes.string.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  locationId: PropTypes.string.isRequired
};
