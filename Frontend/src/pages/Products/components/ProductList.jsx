import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, category }) {
  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(product => product.category === category);

  return (
    <div className="space-y-4">
      {filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <p className="text-center py-6 text-gray-500 font-paprika">
          {products.length ? 'No hay productos en esta categoría' : 'No hay productos disponibles'}
        </p>
      )}
    </div>
  );
}
