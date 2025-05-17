import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { locationService } from '../services/locationService';
import { productService } from '../services/productService';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
    // Enhanced function to check if a user is allowed to use the favorites feature
  const isFavoritingAllowed = useCallback((userEmail) => {
    // If no email is provided, use the one from localStorage
    const email = userEmail || localStorage.getItem('userEmail');
    
    // Update current user email for context
    if (email && currentUserEmail !== email) {
      setCurrentUserEmail(email);
    }
    
    // Only users with emails ending in @sabanapos.edu.co are NOT allowed to use favorites
    // All other users including @unisabana.edu.co ARE allowed to use favorites
    const isAllowed = !(email && email.endsWith('@sabanapos.edu.co'));
    console.log(`Checking if ${email} is allowed to use favorites: ${isAllowed}`);
    return isAllowed;
  }, [currentUserEmail]);
  
  // Get favorites from Firestore specifically for the current user
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      // Check for JWT token and user email from localStorage
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token || !userEmail) {
        // User is not logged in, so we can't fetch favorites
        setFavorites([]);
        return;
      }

      // Update current user email
      setCurrentUserEmail(userEmail);

      // Query Firestore for favorites specific to this user
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userEmail', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      const favoritesList = [];
      querySnapshot.forEach(doc => {
        favoritesList.push({
          ...doc.data(),
          id: doc.data().productId, // Use productId as the main id for consistency
          docId: doc.id // Store the Firestore document ID separately
        });
      });
      
      setFavorites(favoritesList);
    } catch (err) {
      console.error('Error fetching favorites from Firestore:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

  // Add a product to favorites
  const addToFavorites = useCallback(async (product) => {
    try {
      setLoading(true);
      // Check for JWT token from localStorage
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token || !userEmail) {
        throw new Error('You must be logged in to add favorites');
      }

      // Update current user email
      setCurrentUserEmail(userEmail);

      // Check if we already have this product in favorites to avoid duplicates
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef, 
        where('userEmail', '==', userEmail),
        where('productId', '==', product.id)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Product already in favorites, no need to add again
        return;
      }

      // Get location name if locationId is provided
      let locationName = 'Unknown Restaurant';
      if (product.locationId && product.locationId !== 'default') {
        try {
          const locationData = await locationService.getLocationById(product.locationId);
          if (locationData) {
            locationName = locationData.name || locationData.nombre || 'Unknown Restaurant';
          }
        } catch (error) {
          console.error('Error fetching location data:', error);
        }
      }

      // Get complete product information if we only have an ID
      let productData = product;
      if (Object.keys(product).length <= 2) { // If we only have ID and locationId
        try {
          const fullProductData = await productService.getProductById(product.id);
          if (fullProductData) {
            productData = { ...fullProductData, ...product };
          }
        } catch (error) {
          console.error('Error fetching complete product data:', error);
        }
      }      // Ensure product has required fields with user-specific data
      const productToAdd = {
        productId: productData.id,
        productName: productData.name || productData.nombre || 'Product',
        productPrice: productData.price || productData.precio || 0,
        productDescription: productData.description || productData.descripcion || '',
        productImage: productData.imageUrl || productData.imagenURL || null,
        locationId: productData.locationId || 'default',
        locationName: product.locationName || locationName,
        userEmail: userEmail, // Explicitly store user email instead of just userId
        createdAt: new Date()
      };
      
      console.log("Adding to Firestore favorites with location:", productToAdd.locationId, productToAdd.locationName);

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'favorites'), productToAdd);
      
      // Update state with the new favorite including the document ID
      setFavorites(prevFavorites => [...prevFavorites, {
        ...productToAdd,
        id: productToAdd.productId, // Use productId as the main id for consistency
        docId: docRef.id // Store the Firestore document ID
      }]);
    } catch (err) {
      console.error('Error adding to Firestore favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

  // Remove a product from favorites
  const removeFromFavorites = useCallback(async (productId) => {
    try {
      setLoading(true);
      // Check for JWT token from localStorage
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token || !userEmail) {
        throw new Error('You must be logged in to remove favorites');
      }

      // Update current user email
      setCurrentUserEmail(userEmail);

      // Find the document ID for the product for this specific user
      const favoriteToRemove = favorites.find(
        item => (item.id === productId || item.productId === productId) && 
                item.userEmail === userEmail
      );
      
      if (!favoriteToRemove || !favoriteToRemove.docId) {
        console.error('Favorite document ID not found for product', productId);
        return;
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'favorites', favoriteToRemove.docId));
      
      // Update state - only remove the favorite for this specific user
      setFavorites(prevFavorites => 
        prevFavorites.filter(item => 
          !(item.id === productId || item.productId === productId) || 
          item.userEmail !== userEmail
        )
      );
    } catch (err) {
      console.error('Error removing from Firestore favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [favorites, currentUserEmail]);
  
  // Check if a product is in favorites for the current user
  const isFavorite = useCallback((productId) => {
    const userEmail = localStorage.getItem('userEmail');
    return favorites.some(item => 
      (item.id === productId || item.productId === productId) && 
      item.userEmail === userEmail
    );
  }, [favorites]);  // Toggle favorite status
  const toggleFavorite = useCallback((product) => {
    try {
      // Make sure we have product data with an ID
      if (!product || !product.id) {
        console.error('Cannot toggle favorite: Missing product ID', product);
        setError('No se puede agregar favorito: Datos de producto incompletos');
        return;
      }      
      // Check if the user is allowed to use favorites
      const userEmail = localStorage.getItem('userEmail');
      console.log('Attempting to toggle favorite for user:', userEmail, 'Product:', product);
      
      if (!isFavoritingAllowed(userEmail)) {
        console.error(`User ${userEmail} not allowed to use favorites feature`);
        setError(`No estás autorizado para usar la función de favoritos. Email: ${userEmail}`);
        return;
      }
        if (isFavorite(product.id)) {
        removeFromFavorites(product.id);
      } else {
        // Extract restaurant name and locationId from URL
        const urlParts = window.location.pathname.split('/').filter(Boolean);
        
        // Check if the URL follows the pattern: /products/[restaurantName]
        // or /food/[restaurantName]/[productId]
        let restaurantName = '';
        let urlLocationId = '';
        
        if (urlParts.length >= 2) {
          if (urlParts[0] === 'products') {
            // URL format: /products/[restaurantName]
            restaurantName = urlParts[1];
            urlLocationId = urlParts[1];
          } else if (urlParts[0] === 'food' && urlParts.length >= 3) {
            // URL format: /food/[restaurantName]/[productId]
            restaurantName = urlParts[1];
            urlLocationId = urlParts[1];
          } else if (window.location.href.includes('/products/')) {
            // Extract from full URL in case the urlParts parsing didn't work
            const match = window.location.href.match(/\/products\/([^/]+)/);
            if (match && match[1]) {
              restaurantName = match[1];
              urlLocationId = match[1];
            }
          }
        }
        
        console.log("Extracted from URL - Restaurant name:", restaurantName, "Location ID:", urlLocationId);
        
        const productWithEmail = {
          ...product,
          userEmail: userEmail,
          // Make sure locationId is properly set - use URL as fallback
          locationId: product.locationId || urlLocationId || 'default',
          // Set restaurant name from URL if not already provided
          locationName: product.locationName || restaurantName || 'Unknown Restaurant'
        };
        console.log("Adding to favorites with data:", productWithEmail);
        addToFavorites(productWithEmail);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err.message);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites, isFavoritingAllowed]);

  // Load favorites when the component mounts or when user changes
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail !== currentUserEmail) {
      setCurrentUserEmail(userEmail);
      fetchFavorites();
    }
  }, [fetchFavorites, currentUserEmail]);

  // Refetch favorites when user changes
  useEffect(() => {
    if (currentUserEmail) {
      fetchFavorites();
    }
  }, [currentUserEmail, fetchFavorites]);

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
        fetchFavorites,
        isFavoritingAllowed
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;