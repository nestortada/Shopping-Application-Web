import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useFavorites } from '../../../context/FavoritesContext';

export default function ProductCard({ product, locationId, onClick }) {
  const { 
    name = "Product", 
    description = "", 
    price = 0, 
    imageUrl, 
    locationName = "Restaurant" 
  } = product;
  const [showDetails, setShowDetails] = useState(false);  
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isFavoritingAllowed } = useFavorites();
  const userEmail = localStorage.getItem('userEmail');
  const canUseFavorites = isFavoritingAllowed(userEmail);
  const toggleDetails = () => {
    setShowDetails(!showDetails);
    
    // Save locationId to localStorage
    if (locationId && locationId !== 'default') {
      localStorage.setItem('selectedLocationId', locationId);
      console.log('ProductCard toggleDetails: Saved locationId to localStorage:', locationId);
    }
    
    // Call the onClick handler if provided
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log("ProductCard: Favorite button clicked by", userEmail);
    
    if (!token || !userEmail) {
      // Show a user-friendly message and redirect to login
      alert('Debes iniciar sesión para agregar favoritos');
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }
      
    // Extract restaurant name from URL
    const urlParts = window.location.pathname.split('/').filter(Boolean);
    let restaurantName = '';
    
    if (urlParts.length >= 2) {
      if (urlParts[0] === 'products') {
        // URL format: /products/[restaurantName]
        restaurantName = urlParts[1];
      } else if (urlParts[0] === 'food' && urlParts.length >= 3) {
        // URL format: /food/[restaurantName]/[productId]
        restaurantName = urlParts[1];
      }
    }
    
    console.log("ProductCard: Location ID from URL:", locationId);
    console.log("ProductCard: Restaurant name from URL:", restaurantName);
    
    const productToFavorite = {
      ...product,
      id: product.id || product._id || product.docId, // Use any valid ID field
      locationId: locationId || urlParts[1], // Use provided locationId or extract from URL
      locationName: product.locationName || restaurantName || 'Unknown Restaurant', // Use location name from product or URL
      userEmail // Include user email explicitly
    };
    
    console.log("ProductCard: Toggling favorite for product", productToFavorite);
    toggleFavorite(productToFavorite);
  };
  const navigateToProductDetail = (e) => {
    e.stopPropagation();
    console.log('Navegando a producto:', product);
    
    // Save locationId to localStorage
    if (locationId && locationId !== 'default') {
      localStorage.setItem('selectedLocationId', locationId);
      console.log('ProductCard: Saved locationId to localStorage:', locationId);
    }
    
    // Intentar usar id o fallback a docId si existe
    const productId = product.id || '';
    navigate(`/food/${locationId}/${productId}`);
  };
    // Basic card (collapsed)
  if (!showDetails) {
    return (
      <article 
        className="w-full max-w-[351px] mx-auto h-auto min-h-[78px] bg-[#CFCFCF] shadow-md rounded-[24px] flex flex-wrap sm:flex-nowrap items-center p-3 sm:p-4 mb-4 cursor-pointer hover:bg-gray-300 transition-colors relative"
        onClick={toggleDetails}
      >
        <img 
          src={imageUrl || `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`}
          alt={name}
          className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] object-cover rounded-lg flex-shrink-0"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`;
          }}
        />
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">          <h3 className="font-paprika text-[16px] sm:text-[18px] text-[#0F172A] truncate">
            {name}
          </h3>
          {locationName && locationName !== "default" && (
            <p className="font-paprika text-[10px] sm:text-[12px] text-[#3F2EDA] font-semibold line-clamp-1">
              {typeof locationName === 'string' ? locationName.toUpperCase() : locationName}
            </p>
          )}
          <p className="font-paprika text-[12px] sm:text-[14px] text-[#475569] line-clamp-1">
            {description}
          </p></div>        <div className="flex flex-col items-end ml-2 flex-shrink-0">
          <div className="font-paprika text-[14px] sm:text-[16px] text-[#0F172A]">
            ${typeof price === 'number' ? price.toLocaleString() : price}
          </div>        </div>
        
        {/* Star-shaped favorite button - only show if user is allowed to use favorites */}
        {canUseFavorites && (
          <button 
            className="absolute top-2 right-2 z-10 w-[36px] h-[30px] bg-[#FAF202] shadow-md rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteClick(e);
            }}
            aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite(product.id) ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 animate-heart-beat" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </article>
    );
  }// Expanded card (with details)
  return (
    <article className="w-full max-w-[351px] mx-auto bg-[#CFCFCF] shadow-md rounded-[24px] p-3 sm:p-4 mb-4 relative">
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-start">
        <div className="flex w-full sm:w-auto items-start">
          <img 
            src={imageUrl || `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`}
            alt={name}
            className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] object-cover rounded-lg flex-shrink-0"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/62x62/CFCFCF/FFF?text=${name.charAt(0)}`;
            }}
          />          <div className="ml-3 sm:ml-4 flex-1 min-w-0">            <h3 className="font-paprika text-[16px] sm:text-[18px] text-[#0F172A] pr-8 sm:pr-0">
              {name}
            </h3>
            {locationName && locationName !== "default" && (
              <p className="font-paprika text-[10px] sm:text-[12px] text-[#3F2EDA] font-semibold">
                {typeof locationName === 'string' ? locationName.toUpperCase() : locationName}
              </p>
            )}
            <div className="font-paprika text-[14px] sm:text-[16px] text-[#0F172A]">
              ${typeof price === 'number' ? price.toLocaleString() : price}
            </div>
          </div>
        </div>        <button 
          onClick={toggleDetails}
          className="text-gray-500 hover:text-gray-700 absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto"
          aria-label="Close details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
          <button 
          className="absolute top-3 right-12 sm:relative sm:top-auto sm:right-auto text-gray-500 hover:text-red-500 transition-colors ml-2"
          onClick={handleFavoriteClick}
          aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite(product.id) ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 animate-heart-beat" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="mt-3">
        <p className="font-paprika text-[12px] sm:text-[14px] text-[#475569]">
          {description}
        </p>
        {product.ingredientes && (
          <div className="mt-2">
            <h4 className="font-paprika text-[12px] sm:text-[14px] text-[#0F172A] font-semibold">Ingredientes:</h4>
            <p className="font-paprika text-[12px] sm:text-[14px] text-[#475569]">
              {product.ingredientes}
            </p>
          </div>        )}
        
        <button
          onClick={navigateToProductDetail}
          className="mt-4 w-full py-2 px-4 bg-[#5947FF] text-white rounded-xl text-sm font-medium hover:bg-[#4937e0] transition-colors"
        >
          Ver detalles
        </button>
      </div>
      
      {/* Star-shaped favorite button */}
      <button 
        className="absolute top-2 right-12 z-10 w-[36px] h-[30px] bg-[#FAF202] shadow-md rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] flex items-center justify-center"
        onClick={handleFavoriteClick}
        aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite(product.id) ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 animate-heart-beat" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    imageUrl: PropTypes.string,
    ingredientes: PropTypes.string,
    locationName: PropTypes.string,
    productId: PropTypes.string,
    productName: PropTypes.string,
    productDescription: PropTypes.string,
    productPrice: PropTypes.number,
    productImage: PropTypes.string
  }).isRequired,
  locationId: PropTypes.string.isRequired,
  onClick: PropTypes.func
};
