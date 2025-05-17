import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import TopBar from './components/TopBar';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import BottomNavWithMap from './components/BottomNavWithMap';
import UserDashboard from '../../components/UserDashboard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [locationTitle, setLocationTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPOSUser, setIsPOSUser] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { cartItemsCount } = useCartContext();
    const location = useLocation();
  const navigate = useNavigate();
  const { locationId: urlLocationId } = useParams();
  
  // Get location from route params or state
  useEffect(() => {
    // First check if we have a location ID in the URL parameters
    if (urlLocationId) {
      setLocationId(urlLocationId);
      
      // Try to set the location title from localStorage if available
      const storedLocations = localStorage.getItem('locations');
      if (storedLocations) {
        try {
          const locations = JSON.parse(storedLocations);
          const location = locations.find(loc => loc.id === urlLocationId);
          if (location) {
            setLocationTitle(location.name);
          }
        } catch (e) {
          console.error('Error parsing locations from localStorage:', e);
        }
      }
    }    // Otherwise check if we have location info in the route state (from MapPage)
    else if (location.state?.locationId) {
      setLocationId(location.state.locationId);
      // Set the location title if available
      if (location.state?.locationTitle) {
        setLocationTitle(location.state.locationTitle);
      }
      
      // Guardar el ID de la ubicación en localStorage para uso en el carrito
      localStorage.setItem('selectedLocationId', location.state.locationId);
      console.log('ProductsPage guardó en localStorage - selectedLocationId:', location.state.locationId);
    } else {
      // Try to determine if POS user
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail?.endsWith('@sabanapos.edu.co')) {
        setIsPOSUser(true);
        // For POS users, use their email prefix as collection name
        setLocationId(userEmail.split('@')[0]);
      } else if (!userEmail && !locationId) {
        // Only redirect to login if there's no email AND no locationId
        navigate('/');
      } else if (!locationId) {
        // If customer but no location selected, redirect to map
        navigate('/map');
      }
    }
  }, [location, navigate, locationId, urlLocationId]);

  // Fetch products when locationId changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!locationId) {
          return; // Wait until we have a valid location ID
        }

        setLoading(true);
          // Fetch from Firestore
        const querySnapshot = await getDocs(collection(db, locationId));        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.nombre || '',
            description: data.descripcion || '',
            category: data.categoria || '',
            categoria: data.categoria || '', // Ensure we have both fields for compatibility
            price: data.precio || 0,
            imageUrl: data.imagenURL || data.imagenUrl || null, // Check both possible field names
            ...data
          };
        });

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [locationId]);
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Handle search input change
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  if (loading) return <div className="flex items-center justify-center h-screen" aria-live="polite"><span className="sr-only">Loading products</span>Loading...</div>;
  if (error) return <div className="text-red-500 p-4" aria-live="assertive" role="alert">{error}</div>;
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
      </header>
      
      <main className="flex-1 w-full max-w-[360px] sm:max-w-[480px] md:max-w-[640px] mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20">
        <SearchBar onSearch={handleSearch} />
        <nav aria-label="Product categories">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </nav>
        <section className="mt-3 sm:mt-4 bg-white rounded-3xl shadow-lg p-3 sm:p-4" aria-label="Product listings">
          <h2 className="sr-only">Products from {locationTitle || 'selected location'}</h2>          <ProductList 
            products={filteredProducts}
            category={selectedCategory}
            onSelectCategory={setSelectedCategory}
            locationId={locationId}
          />
        </section>
      </main>

      <BottomNavWithMap active="home" isCustomer={!isPOSUser} />
    </div>
  );
}
