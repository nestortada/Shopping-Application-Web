import React from 'react';
import PropTypes from 'prop-types';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getUserProfile } from '../../../services/authService';

export default function DeleteProductModal({ isOpen, onClose, product, onConfirmDelete }) {
  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!product) {
      console.error('Error: Producto no definido');
      onClose();
      return;
    }

    try {
      // Obtener perfil y validar dominio
      const profile = await getUserProfile();
      if (!profile.email?.endsWith('@sabanapos.edu.co')) {
        throw new Error('Acceso no autorizado');
      }

      const collectionName = profile.email.split('@')[0];
      console.log('Buscando producto por nombre:', product.nombre);

      // Modo alternativo: buscar el producto por nombre
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

      // Eliminar el documento usando el ID real
      await deleteDoc(doc(db, collectionName, docId));
      console.log('Producto eliminado con éxito usando ID real de Firestore');

      // Actualizar la UI
      onConfirmDelete(docId);
      onClose();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal panel */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] max-w-md bg-white rounded-2xl shadow-xl overflow-y-auto">
        <div className="p-6">
          <h2 className="text-center text-2xl font-medium text-red-600 mb-4">
            Eliminar producto
          </h2>

          <div className="text-center mb-6">
            <p className="text-gray-800">
              ¿Realmente quieres eliminar este producto? No podrás cancelar esta acción
            </p>
            {product && (
              <p className="mt-2 font-medium">{product.nombre}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              className="w-full py-2 px-4 rounded-xl border border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              No, regresar
            </button>
            <button
              className="w-full py-2 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              onClick={handleDelete}
            >
              Sí, borrar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

DeleteProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    nombre: PropTypes.string
  }),
  onConfirmDelete: PropTypes.func.isRequired,
};
