import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, update, push, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import BottomNav from '../../components/BottomNav';
import BulkProductsModal from '../../components/BulkProductsModal';
import barcodeIcon from '../../assets/codigo-de-barras.png';
import backArrowIcon from '../../assets/flecha-correcta.png';
import editIcon from '../../assets/lapiz.png';
import deleteIcon from '../../assets/basura.png';

export default function Inventary() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Reference to the products in Realtime Database
    const productsRef = ref(db, 'products');

    // Set up real-time listener
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const productsData = [];
      snapshot.forEach((childSnapshot) => {
        productsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setProducts(productsData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleDelete = async (productId) => {
    try {
      const productRef = ref(db, `products/${productId}`);
      await remove(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = async (productId, updatedData) => {
    try {
      const productRef = ref(db, `products/${productId}`);
      await update(productRef, updatedData);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleBulkProductSubmit = async (data) => {
    try {
      const response = await fetch('/v1/pos/inventory/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al añadir productos en lote');
      }

      // Add the products to Realtime Database
      const productsRef = ref(db, 'products');
      const promises = data.productos.map(product => {
        const newProductRef = push(productsRef);
        return set(newProductRef, {
          name: product.nombre,
          category: product.categoria,
          stock: product.stock,
          price: product.precio,
          description: product.descripcion,
          imageUrl: product.imagenUrl,
          perfil: 'POS'
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error adding bulk products:", error);
    }
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-y-auto">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-[41px] bg-[#1D1981] flex justify-between items-center px-4 z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="w-8 h-8 flex items-center justify-center"
        >
          <img 
            src={backArrowIcon} 
            alt="Back" 
            className="w-[33px] h-[33px] transform rotate-180" 
          />
        </button>
        <img src={barcodeIcon} alt="Barcode" className="w-[35px] h-[35px]" />
      </header>

      {/* Title */}
      <h1 className="text-[30px] font-paprika text-center mt-[92px] mb-[25px]">
        Inventario
      </h1>

      {/* Main content */}
      <div className="w-[361px] h-[505px] mx-auto bg-white shadow-md rounded-[24px]">
        {/* Table Header */}
        <div className="w-full h-[46px] bg-[#D9D9D9] grid grid-cols-6 items-center px-4 rounded-t-[24px]">
          <span className="text-[10px] font-paprika">ID</span>
          <span className="text-[10px] font-paprika">Producto</span>
          <span className="text-[10px] font-paprika">Categoría</span>
          <span className="text-[10px] font-paprika">Stock</span>
          <span className="text-[10px] font-paprika">Precio</span>
          <span className="text-[10px] font-paprika">Acción</span>
        </div>

        {/* Table Content */}
        <div className="h-[459px] overflow-y-auto">
          {products.map((product) => (
            <div 
              key={product.id}
              className="w-[357px] h-[45.49px] mx-auto my-2 bg-white shadow-md rounded-[24px] grid grid-cols-6 items-center px-4"
            >
              <span className="text-[10px] font-paprika">{product.id}</span>
              <span className="text-[7px] font-paprika">{product.name}</span>
              <span className="text-[7px] font-paprika">{product.category}</span>
              <div className="flex items-center">
                <span className="text-[7px] font-paprika">{product.stock}</span>
                {product.stock <= 10 && (
                  <div className="ml-2 px-2 py-1 bg-[#FFCE9D] rounded-[12px] border border-[#E2E8F0]">
                    <span className="text-[7px] font-paprika text-[#FF7700]">Bajas</span>
                  </div>
                )}
              </div>
              <span className="text-[7px] font-paprika">${product.price?.toLocaleString()}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    // Here you would typically open an edit modal/form
                    const updatedData = {
                      // Example update
                      stock: product.stock + 1
                    };
                    handleEdit(product.id, updatedData);
                  }}
                  className="w-6 h-6 bg-contain bg-no-repeat"
                  style={{ backgroundImage: `url(${editIcon})` }}
                  aria-label="Edit"
                />
                <button
                  onClick={() => handleDelete(product.id)}
                  className="w-6 h-6 bg-contain bg-no-repeat"
                  style={{ backgroundImage: `url(${deleteIcon})` }}
                  aria-label="Delete"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <button 
        className="fixed bottom-[100px] right-[16px] w-[66px] h-[66px] bg-[#3942ED] rounded-full flex items-center justify-center"
        aria-label="Add product"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="w-[42px] h-[42px] flex items-center justify-center">
          <span className="text-white text-3xl">+</span>
        </div>
      </button>

      {/* Bulk Products Modal */}
      <BulkProductsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBulkProductSubmit}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}