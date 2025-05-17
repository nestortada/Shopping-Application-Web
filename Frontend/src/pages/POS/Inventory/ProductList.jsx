import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getUserProfile } from '../../../services/authService';
import BottomNav from '../../../components/BottomNav';
import AddProductModal from './AddProductModal';
import DeleteProductModal from './DeleteProductModal';
import UpdateProductModal from './UpdateProductModal';
import NotificationBell from '../../../components/NotificationBell';
import barcodeIcon from '../../../assets/codigo-de-barras.png';
import deleteIcon from '../../../assets/basura.png';
import editIcon from '../../../assets/editar.png';

export default function ProductList() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();

        if (!profile.email?.endsWith('@sabanapos.edu.co')) {
          throw new Error('Acceso no autorizado');
        }

        const userCollectionName = profile.email.split('@')[0];
        setCollectionName(userCollectionName);
        const snapshot = await getDocs(collection(db, userCollectionName));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(lista);
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError(err.message);
        if (err.message === 'Acceso no autorizado') navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductos();
  }, [navigate]);  

  const handleDeleteClick = (product) => {
    console.log("Producto seleccionado para eliminar:", product);
    setSelectedProduct(product);
    setError(''); // Limpiar errores previos
    setIsDeleteModalOpen(true);
  };  

  const handleDeleteProduct = async (productId) => {
    try {
      console.log("Eliminando producto con ID:", productId);
      console.log("Nombre de colección:", collectionName);
      setIsLoading(true);
      
      if (!collectionName) {
        console.error("Nombre de colección no disponible");
        setError("Error: No se pudo determinar la colección en Firestore");
        return;
      }
      
      if (!productId) {
        console.error("ID de producto no válido:", productId);
        setError("Error: ID de producto no válido");
        return;
      }
      
      // Eliminar de Firebase
      const productRef = doc(db, collectionName, productId);
      console.log("Referencia del producto a eliminar:", `${collectionName}/${productId}`);
      await deleteDoc(productRef);
      console.log("Producto eliminado en Firestore con ID:", productId);
        // Actualizar la lista de productos
      setProductos(prevProductos => 
        prevProductos.filter(producto => producto.id !== productId)
      );
      
      // Mostrar mensaje de éxito
      setSuccess('Producto eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000); // Desaparece después de 3 segundos
      
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('Error al eliminar el producto. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product) => {
    console.log("Producto seleccionado para editar:", product);
    setSelectedProduct(product);
    setError(''); // Limpiar errores previos
    setIsUpdateModalOpen(true);
  };

  const handleUpdateProduct = (productId, updatedProduct) => {
    try {
      console.log("Actualizando producto con ID:", productId);
      
      // Actualizar la lista de productos en el estado
      setProductos(prevProductos => 
        prevProductos.map(producto => 
          producto.id === productId ? { ...producto, ...updatedProduct } : producto
        )
      );
      
      // Mostrar mensaje de éxito
      setSuccess('Producto actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000); // Desaparece después de 3 segundos
      
    } catch (err) {
      console.error('Error al actualizar producto en la UI:', err);
      setError('Error al actualizar el producto en la interfaz.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pb-24">        {/* Header */}
        <header className="sticky top-0 bg-[#1D1981] shadow-lg rounded-b-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={() => navigate(-1)} 
              aria-label="Volver" 
              className="text-white hover:bg-[#2d2991] p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-white text-xl font-semibold">Inventario</h1>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <button 
                aria-label="Código de barras" 
                className="p-2 hover:bg-[#2d2991] rounded-full transition-colors"
              >
                <img src={barcodeIcon} alt="Código de barras" className="w-6 h-6 object-contain" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6">          
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D1981]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
              <p>{error}</p>
            </div>
          ) : success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4" role="alert">
              <p>{success}</p>
            </div>
          ) : (
            <section className="bg-white rounded-lg shadow-sm">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-7 gap-4 bg-gray-100 px-4 py-3 rounded-t-lg">
                <div className="text-sm font-medium text-gray-700">ID</div>
                <div className="col-span-2 text-sm font-medium text-gray-700">Producto</div>
                <div className="text-sm font-medium text-gray-700">Categoría</div>
                <div className="text-sm font-medium text-gray-700">Stock</div>
                <div className="text-sm font-medium text-gray-700">Precio</div>
                <div className="text-sm font-medium text-gray-700">Acción</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {productos.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No hay productos disponibles</p>
                  </div>
                ) : (
                  productos.map((producto, i) => (
                    <article
                      key={producto.id}
                      className="grid grid-cols-2 sm:grid-cols-7 gap-4 items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm text-gray-600">{i + 1}</div>
                      <div className="col-span-1 sm:col-span-2 text-sm font-medium">{producto.nombre}</div>
                      <div className="hidden sm:block text-sm text-gray-600">{producto.categoria || 'Sin categoría'}</div>
                      <div className="hidden sm:block text-sm text-gray-600">{producto.stock || 0}</div>
                      <div className="text-sm text-gray-900">${producto.precio?.toLocaleString()}</div>
                      <div className="flex gap-2 justify-end">
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" 
                          aria-label="Editar producto"
                          onClick={() => handleEditClick(producto)}
                        >
                          <img src={editIcon} alt="Editar" className="w-5 h-5" />
                        </button>                        
                        <button 
                          type="button"
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" 
                          aria-label="Eliminar producto"
                          onClick={() => handleDeleteClick(producto)}
                        >
                          <img src={deleteIcon} alt="Eliminar" className="w-5 h-5" />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Floating Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#1D1981] hover:bg-[#2d2991] rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Agregar producto"
          >
            <span className="text-white text-3xl">+</span>          
          </button>
        </main>
      </div>
      
      {/* Modals */}      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <DeleteProductModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        product={selectedProduct} 
        onConfirmDelete={handleDeleteProduct} 
      />
      <UpdateProductModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        product={selectedProduct}
        onUpdateSuccess={handleUpdateProduct}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <BottomNav active="inventary" />
        </div>
      </nav>
    </div>
  );
}
