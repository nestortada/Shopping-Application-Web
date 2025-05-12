import React, { useState } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import InputBox from './InputBox';

const defaultProduct = {
  id: '',
  name: '',
  category: '',
  stock: '',
  price: '',
  description: '',
  imageFile: null,
  imageUrl: ''
};

const categories = [
  'Bebida caliente',
  'Bebida fría',
  'Comida rápida',
  'Postre',
  'Snack'
];

export default function BulkProductsModal({ isOpen, onClose, onSubmit }) {
  const [products, setProducts] = useState([defaultProduct]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setProducts([...products, { ...defaultProduct }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleFileChange = async (index, file) => {
    if (!file) return;

    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      imageFile: file
    };
    setProducts(updatedProducts);
  };  const uploadImage = async (file) => {
    try {
      if (!file) throw new Error('No file provided');
      
      // Validar el tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      // Validar el tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB');
      }
      
      // Crear nombre único y seguro para el archivo
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      // Crear referencia al archivo
      const fileRef = storageRef(storage, `products/${uniqueFilename}`);
      
      // Subir archivo con metadata
      const metadata = {
        contentType: file.type,
        cacheControl: 'public,max-age=7200',
        customMetadata: {
          'uploadedAt': new Date().toISOString(),
          'originalName': file.name
        }
      };

      // Intentar subir el archivo
      let uploadResult;
      try {
        uploadResult = await uploadBytes(fileRef, file, metadata);
      } catch (uploadError) {
        console.error('Error en primer intento de subida:', uploadError);
        
        // Segundo intento con tipo de contenido genérico
        metadata.contentType = 'application/octet-stream';
        uploadResult = await uploadBytes(fileRef, file, metadata);
      }

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Archivo subido exitosamente:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setError(error.message || 'Error al subir la imagen. Por favor, intente nuevamente.');
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Upload images first
      const productsWithUrls = await Promise.all(
        products.map(async (product) => {
          if (product.imageFile) {
            try {
              const imageUrl = await uploadImage(product.imageFile);
              return { ...product, imageUrl };
            } catch (error) {
              console.error(`Error uploading image for product ${product.name}:`, error);
              throw error;
            }
          }
          return product;
        })
      );

      // Format the data for submission
      const formattedData = {
        productos: productsWithUrls.map(product => ({
          nombre: product.name,
          categoria: product.category,
          stock: parseInt(product.stock),
          precio: parseFloat(product.price),
          descripcion: product.description,
          imagenUrl: product.imageUrl
        }))
      };

      // Submit the data
      await onSubmit(formattedData);
      setProducts([defaultProduct]);
      onClose();
    } catch (error) {
      console.error('Error submitting products:', error);
      setError('Error al subir los productos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[24px] shadow-lg w-[360px] max-h-[455px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-paprika text-center mb-4">Agregar Productos</h2>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Product forms */}
          {products.map((product, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-paprika">Producto {index + 1}</span>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="ID del producto"
                value={product.id}
                onChange={(e) => handleInputChange(index, 'id', e.target.value)}
                className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100"
                required
              />

              <input
                type="text"
                placeholder="Nombre del producto"
                value={product.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100"
                required
              />

              <select
                value={product.category}
                onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Cantidad de stock"
                value={product.stock}
                onChange={(e) => handleInputChange(index, 'stock', e.target.value)}
                className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100"
                required
              />

              <input
                type="number"
                placeholder="Precio"
                value={product.price}
                onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100"
                required
              />

              <textarea
                placeholder="Descripción del producto"
                value={product.description}
                onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100 resize-none"
                rows={3}
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-paprika">
                  Imagen del producto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  className="w-full p-2 border rounded-lg opacity-25 focus:opacity-100"
                  required
                />
              </div>
            </div>
          ))}

          {/* Add more products button */}
          <button
            type="button"
            onClick={handleAddProduct}
            className="w-full p-2 mt-4 bg-[#1D1981] text-white rounded-lg hover:bg-[#161360]"
          >
            + Agregar otro producto
          </button>

          {/* Action buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 p-3 bg-[#0E2F55] text-white rounded-lg hover:bg-[#0A2440] disabled:bg-gray-400"
            >
              {isLoading ? 'Añadiendo...' : 'Añadir inventario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
