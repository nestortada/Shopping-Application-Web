import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useCartContext } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import StarRating from './components/StarRating';
import RatingModal from './components/RatingModal';
import TopBar from './components/TopBar';
import BottomNavWithMap from './components/BottomNavWithMap';
import UserDashboard from '../../components/UserDashboard';

export default function FoodPage() {
  const { locationId, productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItemsCount } = useCartContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isPOSUser, setIsPOSUser] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [locationTitle, setLocationTitle] = useState('');
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  // Effect to check if user is POS user and get location title
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail?.endsWith('@sabanapos.edu.co')) {
      setIsPOSUser(true);
    }
    
    // Set location title if it's in localStorage
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
      try {
        const locations = JSON.parse(storedLocations);
        const location = locations.find(loc => loc.id === locationId);
        if (location) {
          setLocationTitle(location.name);
        } else {
          // Try to get the title from the collection itself if not found in localstorage
          setLocationTitle(locationId); // Default to collection ID as fallback
        }
      } catch (e) {
        console.error('Error parsing locations from localStorage:', e);
      }
    }
  }, [locationId]);

  // Fetch product details and ratings
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        console.log('Buscando producto con ID:', productId, 'en colección:', locationId);
        
        // Query to find the product
        const productQuery = query(
          collection(db, locationId),
          where('id', '==', productId)
        );
        
        const querySnapshot = await getDocs(productQuery);
        console.log('Resultados encontrados:', querySnapshot.size);
        
        if (querySnapshot.empty) {
          // Intentar buscar por ID de documento
          try {
            const productDoc = await getDoc(doc(db, locationId, productId));
            
            if (productDoc.exists()) {
              const productData = {
                id: productDoc.id,
                name: productDoc.data()?.nombre || '',
                description: productDoc.data()?.descripcion || '',
                category: productDoc.data()?.categoria || '',
                price: productDoc.data()?.precio || 0,
                imageUrl: productDoc.data()?.imagenURL || productDoc.data()?.imagenUrl || null,
                ingredientes: productDoc.data()?.ingredientes || '',
                ...productDoc.data()
              };
              
              setProduct(productData);
            } else {
              throw new Error('Producto no encontrado');
            }
          } catch (docError) {
            console.error('Error al buscar por ID de documento:', docError);
            throw new Error('Producto no encontrado');
          }
        } else {
          // Tomar el primer documento que coincide
          const foundDoc = querySnapshot.docs[0];
          const productData = {
            id: foundDoc.id,
            docId: foundDoc.id,
            name: foundDoc.data()?.nombre || '',
            description: foundDoc.data()?.descripcion || '',
            category: foundDoc.data()?.categoria || '',
            price: foundDoc.data()?.precio || 0,
            imageUrl: foundDoc.data()?.imagenURL || foundDoc.data()?.imagenUrl || null,
            ingredientes: foundDoc.data()?.ingredientes || '',
            ...foundDoc.data()
          };
          
          setProduct(productData);
        }
          // Fetch ratings - intentamos buscar ratings para este producto
        const productReferenceId = productId; // Usamos el ID que viene en la URL
        
        const ratingsQuery = query(
          collection(db, 'ratings'),
          where('productId', '==', productReferenceId),
          where('locationId', '==', locationId)
        );
        
        const ratingsSnapshot = await getDocs(ratingsQuery);
        if (!ratingsSnapshot.empty) {
          let totalRating = 0;
          ratingsSnapshot.forEach(doc => {
            totalRating += doc.data().rating;
          });
          
          setAverageRating(totalRating / ratingsSnapshot.size);
          setRatingCount(ratingsSnapshot.size);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (locationId && productId) {
      fetchProduct();
    }
  }, [locationId, productId]);  const handleAddToCart = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Store the intended redirect location
      localStorage.setItem('redirectAfterLogin', `/products/${locationId}`);
      // Redirect to login
      navigate('/');
      return;
    }
    
    if (product) {
      addToCart({
        id: product.id,
        name: product.nombre || product.name,
        price: product.precio || product.price,
        imageUrl: product.imagenURL || product.imageUrl,
        quantity
      }, quantity);
      
      // Mostrar notificación de producto agregado
      setShowAddedToCart(true);
      
      // Redirigir a ProductsPage después de un breve retraso
      setTimeout(() => {
        navigate(`/products/${locationId}`);
      }, 1000);
    }
  };
  
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleRateProduct = () => {
    setIsRatingModalOpen(true);
  };
    const handleRatingSubmit = async (rating, comment) => {
    try {
      // Guardar una referencia al ID que usamos (ya sea ID del documento o ID propio del producto)
      const productReferenceId = product.id;
      
      // Save rating to Firebase
      await addDoc(collection(db, 'ratings'), {
        productId: productReferenceId,
        locationId,
        rating,
        comment,
        timestamp: new Date()
      });
      
      // Update the average rating
      setAverageRating(prev => {
        const newTotal = prev * ratingCount + rating;
        const newCount = ratingCount + 1;
        return newTotal / newCount;
      });
      
      setRatingCount(prev => prev + 1);
      setIsRatingModalOpen(false);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };
    if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D1981]"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
      Error: {error}
    </div>
  );
  
  if (!product) return (
    <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
      Producto no encontrado
    </div>
  );

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
          isCustomer={!isPOSUser} 
          cartItemsCount={cartItemsCount} 
          locationTitle={locationTitle}
          onProfileClick={() => setIsSidebarOpen(true)}
        />
      </header>      <main className="flex-1 w-full max-w-[360px] sm:max-w-[480px] md:max-w-[640px] mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20">
        <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Product image - Reduced size */}
          <figure className="relative w-full h-[120px] sm:h-[160px] md:h-[200px] bg-gray-200">
            <button 
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
              aria-label="Volver"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Favorite button */}
            <button 
              className="absolute top-4 right-4 z-10 w-[36px] h-[30px] bg-[#FAF202] shadow-md rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] flex items-center justify-center"
              onClick={() => toggleFavorite({...product, id: productId, locationId})}
              aria-label={isFavorite(productId) ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite(productId) ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 animate-heart-beat" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <img 
              src={product.imagenURL || product.imageUrl || `https://placehold.co/640x360/CFCFCF/FFF?text=${product.nombre?.charAt(0) || 'P'}`}
              alt={product.nombre || product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/640x360/CFCFCF/FFF?text=${product.nombre?.charAt(0) || 'P'}`;
              }}
            />
          </figure>
          
          {/* Product info */}
          <div className="p-4 sm:p-5 md:p-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="mb-2 sm:mb-0">
                <h1 className="font-paprika text-xl sm:text-2xl text-[#0F172A]">
                  {product.nombre || product.name}
                </h1>
                <p className="font-paprika text-sm text-[#475569] mt-1">
                  {product.categoria || product.category}
                </p>
              </div>
              <div className="text-xl sm:text-2xl font-paprika text-[#0F172A]">
                ${(product.precio || product.price).toLocaleString()}
              </div>
            </header>
            
            {/* Ratings */}
            <div className="flex flex-wrap items-center mt-3">
              <StarRating value={averageRating} readOnly />
              <span className="ml-2 text-sm text-gray-600">({ratingCount} calificaciones)</span>
              <button 
                onClick={handleRateProduct}
                className="ml-auto sm:ml-4 text-sm text-[#5947FF] hover:underline"
                aria-label="Calificar este producto"
              >
                Calificar producto
              </button>
            </div>
            
            {/* Description */}
            <section className="mt-4 sm:mt-6">
              <h2 className="font-paprika text-lg text-[#0F172A] font-medium">Descripción</h2>
              <p className="font-paprika text-[#475569] mt-2">
                {product.descripcion || product.description}
              </p>
            </section>
            
            {/* Ingredients if available */}
            {(product.ingredientes || product.ingredients) && (
              <section className="mt-4 sm:mt-6">
                <h2 className="font-paprika text-lg text-[#0F172A] font-medium">Ingredientes</h2>
                <p className="font-paprika text-[#475569] mt-2">
                  {product.ingredientes || product.ingredients}
                </p>
              </section>
            )}
            
            {/* Quantity controls */}
            <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 sm:mt-8">
              <div className="flex items-center border border-gray-300 rounded-xl mb-4 sm:mb-0" role="group" aria-label="Controles de cantidad">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  <span className="text-xl">-</span>
                </button>
                <span className="w-10 text-center font-medium" aria-live="polite">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                  aria-label="Aumentar cantidad"
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto py-3 px-6 sm:px-8 bg-[#5947FF] text-white rounded-xl font-medium hover:bg-[#4937e0] transition-colors"
                aria-label="Añadir producto al carrito"
              >
                Añadir al carrito
              </button>
            </footer>
          </div>
        </article>
      </main>      <BottomNavWithMap active="home" isCustomer={!isPOSUser} />
      
      {/* Rating modal */}
      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        productName={product.nombre || product.name}
      />

      {/* Mensaje de producto agregado al carrito */}
      {showAddedToCart && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-4/5 max-w-sm bg-[#5947FF] text-white py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 animate-fade-in-up z-50" aria-live="polite">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">¡Producto agregado al carrito!</span>
        </div>
      )}
    </div>
  );
}
