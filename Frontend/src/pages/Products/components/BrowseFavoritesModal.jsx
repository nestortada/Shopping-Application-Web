import React, { useState, useEffect } from 'react';
import { locationService } from '../../../services/locationService';
import { productService } from '../../../services/productService';
import { useFavorites } from '../../../context/FavoritesContext';

export default function BrowseFavoritesModal({ isOpen, onClose }) {
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [view, setView] = useState('locations'); // 'locations' or 'products'
  const { addToFavorites, isFavorite, isFavoritingAllowed } = useFavorites();
  const userEmail = localStorage.getItem('userEmail');
  const canUseFavorites = isFavoritingAllowed(userEmail);

  // Load locations on first render
  useEffect(() => {
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen]);

  // Load products when a location is selected
  useEffect(() => {
    if (selectedLocation) {
      fetchProducts(selectedLocation.id);
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const result = await locationService.getLocations();
      setLocations(result.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (locationId) => {
    try {
      setLoadingProducts(true);
      const result = await productService.getProducts(locationId);
      setProducts(result.products);
      setView('products');
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      
      if (view === 'locations') {
        const results = await locationService.searchLocationsByName(searchTerm);
        setLocations(results);
        
        // Display a message if no locations were found
        if (results.length === 0) {
          console.log('No restaurants found for:', searchTerm);
        }
      } else {
        const results = await productService.searchProductsByName(searchTerm);
        // Filter products by selected location if we have one
        const filteredResults = selectedLocation 
          ? results.filter(p => p.locationId === selectedLocation.id)
          : results;
        setProducts(filteredResults);
        
        // Display a message if no products were found
        if (filteredResults.length === 0) {
          console.log('No products found for:', searchTerm);
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
      // Set an error state that could be displayed to the user
      const errorMessage = view === 'locations' 
        ? 'Error searching for restaurants' 
        : 'Error searching for products';
      console.log(errorMessage, error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleBackToLocations = () => {
    setView('locations');
    setSelectedLocation(null);
    setProducts([]);
  };
  const handleAddToFavorites = (product) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }
    
    // Ensure product has the location ID and user email
    const productWithLocation = {
      ...product,
      locationId: selectedLocation.id,
      locationName: selectedLocation.name || selectedLocation.nombre,
      userEmail: userEmail // Include user email explicitly
    };
    
    addToFavorites(productWithLocation);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {view === 'locations' ? 'Restaurantes' : 'Productos'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search bar */}
          <div className="mt-3 flex">
            <input
              type="text"
              placeholder={view === 'locations' ? "Buscar restaurante..." : "Buscar producto..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#3F2EDA] text-white rounded-r-lg hover:bg-[#3022A0]"
            >
              Buscar
            </button>
          </div>

          {/* Navigation */}
          {view === 'products' && (
            <button
              onClick={handleBackToLocations}
              className="mt-2 text-sm text-[#3F2EDA] hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a restaurantes
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Cargando...</p>
            </div>
          ) : view === 'locations' ? (
            // Locations view
            <div className="grid grid-cols-1 gap-3">
              {locations.length > 0 ? (
                locations.map(location => (
                  <div 
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {location.imageUrl ? (
                          <img 
                            src={location.imageUrl} 
                            alt={location.name || location.nombre} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xl font-bold text-gray-500">
                            {(location.name || location.nombre || "R").charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{location.name || location.nombre}</h3>
                        <p className="text-sm text-gray-500">
                          {location.address || location.direccion || "Sin dirección"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No se encontraron restaurantes</p>
              )}
            </div>
          ) : (
            // Products view
            <div className="grid grid-cols-1 gap-3">
              {loadingProducts ? (
                <div className="flex justify-center items-center h-32">
                  <p>Cargando productos...</p>
                </div>
              ) : products.length > 0 ? (
                products.map(product => (
                  <div 
                    key={product.id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name || product.nombre} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-gray-500">
                            {(product.name || product.nombre || "P").charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{product.name || product.nombre}</h3>
                        <p className="text-sm text-gray-500">
                          ${product.price || 0}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToFavorites(product)}
                      className={`p-2 rounded-full ${
                        isFavorite(product.id) 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-red-500'
                      }`}
                      disabled={isFavorite(product.id)}
                      aria-label={isFavorite(product.id) ? "Ya es favorito" : "Agregar a favoritos"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No se encontraron productos para este restaurante
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
