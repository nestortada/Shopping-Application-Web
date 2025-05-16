import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db, storage } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getUserProfile } from '../../../services/authService';

export default function UpdateProductModal({ isOpen, onClose, product, onUpdateSuccess }) {
  const categorias = [
    'Bebida Caliente',
    'Bebida Fría',
    'Pollo',
    'Carne',
    'Hamburguesas'
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    ingredientes: '',
    stock: '',
    precio: '',
    imagen: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  // Efecto para cargar los datos iniciales del producto
  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        categoria: product.categoria || '',
        descripcion: product.descripcion || '',
        ingredientes: product.ingredientes || '',
        stock: product.stock || '',
        precio: product.precio || '',
        imagen: null
      });
      
      // Establece la imagen preview si el producto tiene una URL de imagen
      if (product.imagenURL) {
        setImagePreview(product.imagenURL);
      } else {
        setImagePreview('');
      }
    }
  }, [product]);
  
  // Estado para controlar qué campos han sido editados por el usuario
  const [touchedFields, setTouchedFields] = useState({
    nombre: false,
    categoria: false,
    descripcion: false,
    ingredientes: false,
    stock: false,
    precio: false,
    imagen: false
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Crear URL para previsualizar la imagen
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
    
    // Marcar el campo como tocado para controlar la opacidad
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleUpdate = async () => {
    if (!product) {
      console.error('Error: Producto no definido');
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Obtener perfil y validar dominio
      const profile = await getUserProfile();
      if (!profile.email?.endsWith('@sabanapos.edu.co')) {
        throw new Error('Acceso no autorizado');
      }

      const collectionName = profile.email.split('@')[0];
      console.log('Buscando producto para actualizar:', product.nombre);

      // Buscar el producto por nombre
      if (!product.nombre) {
        throw new Error('El producto no tiene nombre para buscar');
      }

      const productQuery = query(
        collection(db, collectionName),
        where('nombre', '==', product.nombre)
      );
      
      const querySnapshot = await getDocs(productQuery);
      console.log('Resultados encontrados:', querySnapshot.size);

      if (querySnapshot.empty) {
        console.error('No se encontró el producto en Firestore');
        onClose();
        return;
      }

      // Tomar el primer documento que coincide
      const foundDoc = querySnapshot.docs[0];
      const docId = foundDoc.id;
      console.log('Producto encontrado, ID real del documento:', docId);

      // Si hay una nueva imagen, subirla primero
      let imageURL = product.imagenURL || ''; // Mantener la imagen anterior si no hay nueva
      if (formData.imagen) {
        const imgRef = ref(storage, `productos/${formData.imagen.name}`);
        await uploadBytes(imgRef, formData.imagen);
        imageURL = await getDownloadURL(imgRef);
      }

      // Actualizar el documento usando el ID real
      await updateDoc(doc(db, collectionName, docId), {
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        ingredientes: formData.ingredientes,
        stock: Number(formData.stock),
        precio: Number(formData.precio),
        imagenURL: imageURL,
      });
      
      console.log('Producto actualizado con éxito');

      // Actualizar la UI y cerrar modal
      onUpdateSuccess(docId, {
        id: docId,
        ...formData,
        stock: Number(formData.stock),
        precio: Number(formData.precio),
        imagenURL: imageURL
      });
      
      onClose();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      setError(error.message);
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
        <div className="p-6 space-y-4">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-paprika text-center flex-1">Actualizar inventario</h2>
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
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Producto */}
            <div className="flex items-center">
              <div className="w-24 text-center">
                <label className="block text-sm font-paprika">Producto</label>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full h-[25.1px] border border-[#E2E8F0] rounded-[12px] px-3 py-1 text-center text-base ${touchedFields.nombre ? 'opacity-100' : 'opacity-25'}`}
                  />
                  {!touchedFields.nombre && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                      <span className="text-base opacity-25">{product?.nombre || ""}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
              {/* Categoría */}
            <div className="flex items-center mt-6">
              <div className="w-24 text-center">
                <label className="block text-sm font-paprika">Categoría</label>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className={`w-full h-[25.1px] border border-[#E2E8F0] rounded-[12px] px-3 py-1 text-base ${touchedFields.categoria ? 'opacity-100' : 'opacity-25'}`}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {!touchedFields.categoria && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                      <span className="text-base opacity-25">{product?.categoria || ""}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Descripción */}
            <div className="flex items-start mt-6">
              <div className="w-24 text-center pt-2">
                <label className="block text-sm font-paprika">Descripción</label>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-base resize-none ${touchedFields.descripcion ? 'opacity-100' : 'opacity-25'}`}
                  ></textarea>
                  {!touchedFields.descripcion && product?.descripcion && (
                    <div className="absolute inset-0 flex justify-center items-center px-3 py-2 pointer-events-none">
                      <span className="text-base opacity-25">{product.descripcion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ingredientes */}
            <div className="flex items-start mt-6">
              <div className="w-24 text-center pt-2">
                <label className="block text-sm font-paprika">Ingredientes</label>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    name="ingredientes"
                    value={formData.ingredientes}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full border border-[#E2E8F0] rounded-[12px] px-3 py-2 text-base resize-none ${touchedFields.ingredientes ? 'opacity-100' : 'opacity-25'}`}
                  ></textarea>
                  {!touchedFields.ingredientes && product?.ingredientes && (
                    <div className="absolute inset-0 flex justify-center items-center px-3 py-2 pointer-events-none">
                      <span className="text-base opacity-25">{product.ingredientes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stock */}
            <div className="flex items-center mt-6">
              <div className="w-24 text-center">
                <label className="block text-sm font-paprika">Stock</label>
              </div>
              <div>
                <div className="relative">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className={`w-[71px] h-[27px] border border-[#E2E8F0] rounded-[12px] px-3 py-1 text-center text-base ${touchedFields.stock ? 'opacity-100' : 'opacity-25'}`}
                  />
                  {!touchedFields.stock && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                      <span className="text-base opacity-25">{product?.stock || "0"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Precio */}
            <div className="flex items-center mt-6">
              <div className="w-24 text-center">
                <label className="block text-sm font-paprika">Precio</label>
              </div>
              <div>
                <div className="relative">
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className={`w-[123px] h-[27px] border border-[#E2E8F0] rounded-[12px] px-3 py-1 text-center text-base ${touchedFields.precio ? 'opacity-100' : 'opacity-25'}`}
                  />
                  {!touchedFields.precio && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                      <span className="text-base opacity-25">{product?.precio || "0"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Imagen */}
            <div className="flex items-start mt-6">
              <div className="w-24 text-center pt-2">
                <label className="block text-sm font-paprika">Imagen</label>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  name="imagen"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1D1981] file:text-white hover:file:bg-[#2d2991] transition-colors"
                />
                
                {/* Previsualización de la imagen */}
                {imagePreview && (
                  <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-4 justify-between mt-10">
            <div className="flex-1">
              <button
                className="w-full h-[51px] py-2 px-4 rounded-xl border border-[#CFCFCF] bg-[#F8F8F8] text-black hover:bg-gray-100 transition-colors font-paprika shadow-md"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
            <div className="flex-1">
              <button
                className="w-full h-[51px] py-2 px-4 rounded-xl bg-[#0E2F55] text-white hover:bg-blue-900 transition-colors font-paprika shadow-md"
                onClick={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar inventario'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

UpdateProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.string,
    nombre: PropTypes.string,
    categoria: PropTypes.string,
    descripcion: PropTypes.string,
    ingredientes: PropTypes.string,
    stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    imagenURL: PropTypes.string
  }),
  onUpdateSuccess: PropTypes.func.isRequired,
};
