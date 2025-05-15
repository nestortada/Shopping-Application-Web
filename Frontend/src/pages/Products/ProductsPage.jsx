import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import TopBar from './components/TopBar';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import BottomNavWithMap from './components/BottomNavWithMap';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [locationId, setLocationId] = useState(null);
  const [locationTitle, setLocationTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPOSUser, setIsPOSUser] = useState(false);  // Use cart context instead of local state for cart items count
  const { cartItemsCount } = useCartContext();
  
  const location = useLocation();
  const navigate = useNavigate();  // Get location from route state if available (from MapPage)
  useEffect(() => {
    if (location.state?.locationId) {
      setLocationId(location.state.locationId);
      // Set the location title if available
      if (location.state?.locationTitle) {
        setLocationTitle(location.state.locationTitle);
      }
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
  }, [location, navigate, locationId]);

  // Fetch products when locationId changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!locationId) {
          return; // Wait until we have a valid location ID
        }

        setLoading(true);
        
        // Fetch from Firestore
        const querySnapshot = await getDocs(collection(db, locationId));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().nombre || '',
          description: doc.data().descripcion || '',
          category: doc.data().categoria || '',
          price: doc.data().precio || 0,
          imageUrl: doc.data().imagenUrl || 'https://placehold.co/62x62/CFCFCF/FFF?text=No+Image',
          ...doc.data()
        }));

        // Fetch from API for prices
        const apiResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/v1/catalog/products`);
        const apiProducts = await apiResponse.json();

        // Merge Firestore data with API prices
        const mergedProducts = productsData.map(product => ({
          ...product,
          price: apiProducts.find(p => p.id === product.id)?.price || product.price
        }));

        setProducts(mergedProducts);
        setFilteredProducts(mergedProducts);
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      <TopBar 
        isCustomer={!isPOSUser} 
        cartItemsCount={cartItemsCount} 
        locationTitle={locationTitle}
      />
      
      <main className="flex-1 max-w-[360px] mx-auto w-full px-4 pt-4 pb-20">
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <section className="mt-4 bg-white rounded-3xl shadow-lg p-4">
          <ProductList 
            products={filteredProducts}
            category={selectedCategory}
          />      </section>
      </main>

      <BottomNavWithMap active="home" isCustomer={!isPOSUser} />
    </div>
  );
}
