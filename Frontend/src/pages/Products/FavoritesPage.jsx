import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import TopBar from './components/TopBar';
import BottomNavWithMap from './components/BottomNavWithMap';
import UserDashboard from '../../components/UserDashboard';
import ProductCard from './components/ProductCard';

// Helper function to get user-friendly restaurant name in uppercase
const getRestaurantDisplayName = (locationId) => {
  if (!locationId) return 'RESTAURANTE';
  
  switch (locationId.toLowerCase()) {
    case 'meson':
      return 'MESÓN DE LA SABANA';
    case 'escuela':
      return 'ESCUELA';
    case 'arcos':
      return 'ARCOS';
    default:
      // If it's another location ID, convert it to a better-looking format
      // Convert locationId like "mesondelasabana" to "MESON DE LA SABANA"
      return locationId.toUpperCase().replace(/([a-z])([A-Z])/g, '$1 $2');
  }
};

export default function FavoritesPage() {
  const { favorites, loading, error, fetchFavorites } = useFavorites();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const itemsPerPage = 5; // Number of favorites to show per page
  const navigate = useNavigate();
  
  // Sort favorites based on selected criteria
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.productName || a.name || '').localeCompare(b.productName || b.name || '');
      case 'price':
        return (a.productPrice || a.price || 0) - (b.productPrice || b.price || 0);
      case 'restaurant':
        return (a.locationName || '').localeCompare(b.locationName || '');
      case 'date':
        // Convert date strings to Date objects for comparison
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB - dateA; // Newest first      default:
        return 0;
    }
  });

  useEffect(() => {
    // Check if user is logged in using JWT token
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      navigate('/login', { state: { from: '/favorites' } });
      return;
    }
    
    // Don't show favorites page for POS users
    if (userEmail.endsWith('@sabanapos.edu.co')) {
      navigate('/products');
      return;
    }
    
    // Fetch favorites when component mounts and user is authenticated
    fetchFavorites();
    
    // Set up an interval to refresh favorites every 30 seconds
    const intervalId = setInterval(() => {
      fetchFavorites();
    }, 30000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
    
  }, [navigate, fetchFavorites]);

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
      
      <main className="flex-1 w-full max-w-[360px] sm:max-w-[480px] md:max-w-[640px] mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20">        <div className="mx-auto w-[255px] h-[30px] bg-[#FEE9E7] text-[#B68E59] py-1 rounded-[24px] shadow-md mb-4 text-center font-paprika text-xl">
          Mis Favoritos        </div>        
        {/* Sorting options */}
        <div className="flex items-center mb-3">
          <label htmlFor="sort-by" className="text-sm text-gray-600 mr-2">Ordenar por:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1); // Reset to first page when sorting changes
            }}
            className="text-sm border rounded-md px-2 py-1 bg-white"
          >
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
            <option value="restaurant">Restaurante</option>
            <option value="date">Más recientes</option>
          </select>
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
            </div>          ) : favorites.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-3xl shadow-lg">
              <p className="text-gray-500 font-paprika mb-4">
                No tienes productos favoritos todavía
              </p>              <button 
                onClick={() => {
                  // Check if user is authenticated - similar to Add to Cart in FoodPage
                  const token = localStorage.getItem('token');
                  
                  if (!token) {
                    // Store the intended redirect location
                    localStorage.setItem('redirectAfterLogin', '/products');
                    // Redirect to login
                    navigate('/');
                    return;
                  }
                  
                  // Get locationId from localStorage if available
                  let locationId = localStorage.getItem('selectedLocationId');
                  
                  // If not found, try with 'meson' key as fallback
                  if (!locationId) {
                    locationId = localStorage.getItem('meson');
                    if (locationId) {
                      localStorage.setItem('selectedLocationId', locationId);
                      console.log('Guardado meson como selectedLocationId:', locationId);
                    }
                  }
                  
                  if (locationId && locationId !== 'default') {
                    // Navigate to the specific restaurant page
                    console.log('Navegando a productos con locationId:', locationId);
                    navigate(`/products/${locationId}`);
                  } else {
                    // Fallback to general products page if no locationId available
                    navigate('/products');
                  }
                }}
                className="bg-[#5947FF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4937e0] transition-colors"
              >
                Explorar productos
              </button>
            </div>) : (
            <ul className="list-none p-0 space-y-3 sm:space-y-4 w-full">
              {sortedFavorites
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(product => (                <li key={product.id || product.productId} className="w-full flex justify-center">
                  <ProductCard 
                    product={{
                      id: product.id || product.productId,
                      name: product.name || product.productName || product.nombre || 'Product',
                      description: product.description || product.productDescription || product.descripcion || '',
                      price: product.price || product.productPrice || product.precio || 0,
                      imageUrl: product.imageUrl || product.productImage || product.imagenURL || null,
                      locationId: product.locationId || 'default',
                      locationName: getRestaurantDisplayName(product.locationId)
                    }} 
                    locationId={product.locationId || 'default'}
                    onClick={() => {
                      // Guardar el locationId en localStorage para su uso en CartPage
                      if (product.locationId && product.locationId !== 'default') {
                        localStorage.setItem('selectedLocationId', product.locationId);
                        console.log('Guardado desde FavoritesPage onClick en localStorage - selectedLocationId:', product.locationId);
                      }
                    }}
                  />
                </li>
              ))}
                {/* Pagination controls */}
              {sortedFavorites.length > itemsPerPage && (
                <li className="flex justify-center mt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#3F2EDA] text-white hover:bg-[#3022A0]'
                      }`}
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 bg-gray-100 rounded-md">
                      Página {currentPage} de {Math.ceil(sortedFavorites.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedFavorites.length / itemsPerPage)))}
                      disabled={currentPage >= Math.ceil(sortedFavorites.length / itemsPerPage)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage >= Math.ceil(sortedFavorites.length / itemsPerPage)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#3F2EDA] text-white hover:bg-[#3022A0]'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </li>
              )}
            </ul>
          )}
        </section>      </main>      <BottomNavWithMap active="favorites" isCustomer={true} />
    </div>
  );
}