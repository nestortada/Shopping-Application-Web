import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getDoc, doc } from 'firebase/firestore';

export const productService = {
  // Get a list of products
  async getProducts(locationId, lastDoc = null, pageSize = 10) {
    try {
      let productsQuery;
      
      if (lastDoc) {
        // Pagination query
        productsQuery = query(
          collection(db, 'products'),
          where('locationId', '==', locationId),
          orderBy('name'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        // First page query
        productsQuery = query(
          collection(db, 'products'),
          where('locationId', '==', locationId),
          orderBy('name'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(productsQuery);
      
      const products = [];
      querySnapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Return the products and the last document for pagination
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { 
        products, 
        lastVisible 
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // Get a single product by ID
  async getProductById(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        return {
          id: productDoc.id,
          ...productDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
  
  // Search products by name (across all locations)
  async searchProductsByName(searchTerm) {
    try {
      // This is a simple implementation that searches all products
      // For a better implementation, consider using keywords array with array-contains
      // or a service like Algolia for more complex searches
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      const results = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const name = data.name || data.nombre || '';
        
        // Case-insensitive search
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};
