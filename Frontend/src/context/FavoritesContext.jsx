import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get favorites from localStorage (temporary until backend is ready)
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User is not logged in, so we can't fetch favorites
        setFavorites([]);
        return;
      }

      // Fetch from localStorage instead of API
      const storedFavorites = localStorage.getItem('userFavorites');
      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
        } catch (parseError) {
          console.error('Error parsing favorites from localStorage:', parseError);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Add a product to favorites
  const addToFavorites = useCallback(async (product) => {
    try {
      setLoading(true);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to add favorites');
      }

      // Check if we already have this product in favorites to avoid duplicates
      const existingFavorites = localStorage.getItem('userFavorites') 
        ? JSON.parse(localStorage.getItem('userFavorites')) 
        : [];
      
      if (existingFavorites.some(fav => fav.id === product.id)) {
        // Product already in favorites, no need to add again
        return;
      }

      // Ensure product has required fields
      const productToAdd = {
        id: product.id,
        name: product.name || product.nombre || 'Product',
        price: product.price || product.precio || 0,
        description: product.description || product.descripcion || '',
        imageUrl: product.imageUrl || product.imagenURL || null,
        locationId: product.locationId || 'default'
      };

      // Add to localStorage
      const updatedFavorites = [...existingFavorites, productToAdd];
      localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));

      // Update state
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  // Remove a product from favorites
  const removeFromFavorites = useCallback(async (productId) => {
    try {
      setLoading(true);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to remove favorites');
      }

      // Get current favorites
      const existingFavorites = localStorage.getItem('userFavorites') 
        ? JSON.parse(localStorage.getItem('userFavorites')) 
        : [];
      
      // Remove product from favorites
      const updatedFavorites = existingFavorites.filter(item => item.id !== productId);
      
      // Update localStorage
      localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));

      // Update state
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  // Check if a product is in favorites
  const isFavorite = useCallback((productId) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]); // Depend on favorites array

  // Toggle favorite status
  const toggleFavorite = useCallback((product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  // Load favorites when the component mounts
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]); // Add fetchFavorites to dependencies since it's now memoized

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites, 
        loading, 
        error, 
        addToFavorites, 
        removeFromFavorites, 
        isFavorite,
        toggleFavorite,
        fetchFavorites 
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;