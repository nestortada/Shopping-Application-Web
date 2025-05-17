// src/pages/POS/Inventary/AddProductModal.jsx
import React, { useState } from 'react';
import { db, storage } from '../../../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../../firebase/firebaseConfig';
import { useNotifications } from '../../../context/NotificationContext';
import { successToast, errorToast } from '../../../utils/toastUtils.jsx';

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    categoria: 'Bebida Caliente',
    descripcion: '',
    ingredientes: '',
    stock: '',
    precio: '',
    imagen: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { notifyFavoriteProductUpdate } = useNotifications();

  const categorias = [
    'Bebida Caliente',
    'Bebida Fría',
    'Pollo',
    'Carne',
    'Hamburguesas'
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get the user's email to determine the collection
      const user = auth.currentUser;
      const userEmail = user ? user.email : null;
      
      if (!userEmail || !userEmail.endsWith('@sabanapos.edu.co')) {
        throw new Error('Acceso no autorizado. Esta operación solo puede ser realizada por usuarios POS.');
      }
      
      // Extract location name from email (e.g., meson@sabanapos.edu.co -> meson)
      const locationName = userEmail.split('@')[0].toLowerCase();
      
      // 1. Subir imagen al Storage
      let imageURL = '';
      if (formData.imagen) {
        const imgRef = ref(storage, `productos/${formData.imagen.name}`);
        await uploadBytes(imgRef, formData.imagen);
        imageURL = await getDownloadURL(imgRef);
      }      // 2. Guardar datos en Firestore
      const docRef = await addDoc(collection(db, locationName), {
        id: formData.id,
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        ingredientes: formData.ingredientes,
        stock: Number(formData.stock),
        precio: Number(formData.precio),
        imagenURL: imageURL
      });

      // 3. Send notification for the new product
      if (Number(formData.stock) > 0) {
        await notifyFavoriteProductUpdate(
          {
            id: docRef.id,
            nombre: formData.nombre
          },
          'stock',
          locationName
        );
      }

      // Show success toast notification
      successToast(`Producto "${formData.nombre}" agregado con éxito`);
      
      onSuccess?.();
      onClose();
      // Opcional: limpia el formulario si lo deseas
      setFormData({
        id: '',
        nombre: '',
        categoria: 'Bebida Caliente',
        descripcion: '',
        ingredientes: '',
        stock: '',
        precio: '',
        imagen: null
      });
    } catch (error) {      console.error("Error al guardar producto:", error);
      setError("Hubo un error al guardar el producto.");
      errorToast(`Error al añadir producto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal panel */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-paprika text-center flex-1">Añadir inventario</h2>
            <button 
              type="button" 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-paprika mb-1">ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID del producto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-paprika mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-paprika mb-1">Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-paprika mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del producto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-paprika mb-1">Ingredientes</label>
              <textarea
                name="ingredientes"
                value={formData.ingredientes}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Lista de ingredientes"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-paprika mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cantidad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-paprika mb-1">Precio</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className="w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Precio"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-paprika mb-1">Imagen</label>
              <input
                type="file"
                name="imagen"
                onChange={handleChange}
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1D1981] file:text-white hover:file:bg-[#2d2991] transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-[#CFCFCF] rounded-[12px] text-black font-paprika hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-[#1D1981] text-white rounded-[12px] font-paprika hover:bg-[#2d2991] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading ? 'Guardando...' : 'Añadir inventario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
