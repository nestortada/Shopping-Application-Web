import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import TopBar from './components/TopBar';
import BottomNavWithMap from './components/BottomNavWithMap';
import UserDashboard from '../../components/UserDashboard';
import ProductCard from './components/ProductCard';

export default function FavoritesPage() {
  const { favorites, loading, error, fetchFavorites } = useFavorites();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/favorites' } });
      return;
    }
    
    // Fetch favorites when component mounts
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Remove fetchFavorites from dependencies

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA] relative">
      {/* Semi-transparent overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-10"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar with UserDashboard */}
      <section
        className={`fixed top-0 left-0 h-full w-64 bg-[#3F2EDA] shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-20`}
        aria-hidden={!isSidebarOpen}
        aria-label="User dashboard"
      >
        <UserDashboard onClose={() => setIsSidebarOpen(false)} />
      </section>
      
      <header>
        <TopBar 
          isCustomer={true} 
          onProfileClick={() => setIsSidebarOpen(true)}
        />
      </header>
      
      <main className="flex-1 w-full max-w-[360px] sm:max-w-[480px] md:max-w-[640px] mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20">
        <div className="mx-auto w-[255px] h-[30px] bg-[#FEE9E7] text-[#B68E59] py-1 rounded-[24px] shadow-md mb-4 text-center font-paprika text-xl">
          Mis Favoritos
        </div>

        <section className="mt-3 sm:mt-4" aria-label="Favorited products">
          <h2 className="sr-only">Productos favoritos</h2>
          
          {loading ? (
            <div className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-lg" aria-live="polite">
              <span className="sr-only">Cargando favoritos</span>
              Cargando...
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center bg-white rounded-3xl shadow-lg" aria-live="assertive" role="alert">
              {error}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-3xl shadow-lg">
              <p className="text-gray-500 font-paprika mb-4">
                No tienes productos favoritos todavía
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="bg-[#5947FF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4937e0] transition-colors"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <ul className="list-none p-0 space-y-3 sm:space-y-4 w-full">              {favorites.map(product => (
                <li key={product.id} className="w-full flex justify-center">
                  <ProductCard 
                    product={{
                      ...product,
                      // Ensure essential properties are present
                      id: product.id,
                      name: product.name || product.nombre || 'Product',
                      description: product.description || product.descripcion || '',
                      price: product.price || product.precio || 0,
                      imageUrl: product.imageUrl || product.imagenURL || null
                    }} 
                    locationId={product.locationId || 'default'} 
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomNavWithMap active="favorites" isCustomer={true} />
    </div>
  );
}