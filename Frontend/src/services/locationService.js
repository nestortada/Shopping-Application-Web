import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getDoc, doc } from 'firebase/firestore';

export const locationService = {
  // Get a list of locations/restaurants
  async getLocations(lastDoc = null, pageSize = 10) {
    try {
      let locationsQuery;
      
      if (lastDoc) {
        // Pagination query
        locationsQuery = query(
          collection(db, 'locations'),
          orderBy('name'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        // First page query
        locationsQuery = query(
          collection(db, 'locations'),
          orderBy('name'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(locationsQuery);
      
      const locations = [];
      querySnapshot.forEach(doc => {
        locations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Return the locations and the last document for pagination
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { 
        locations, 
        lastVisible 
      };
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  
  // Get a single location by ID
  async getLocationById(locationId) {
    try {
      const locationRef = doc(db, 'locations', locationId);
      const locationDoc = await getDoc(locationRef);
      
      if (locationDoc.exists()) {
        return {
          id: locationDoc.id,
          ...locationDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  },
  
  // Search locations by name
  async searchLocationsByName(searchTerm) {
    try {
      // Note: This is a simple implementation that searches for exact matches
      // For a better search experience, consider using Firestore's array-contains 
      // with keywords, or use a service like Algolia
      const locationsRef = collection(db, 'locations');
      const querySnapshot = await getDocs(locationsRef);
      
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
      console.error('Error searching locations:', error);
      throw error;
    }
  }
};
