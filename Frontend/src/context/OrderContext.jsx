import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Create a new order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add order to Firebase
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        orderTimestamp: new Date(),
      });
      
      const newOrder = {
        id: docRef.id,
        ...orderData,
        orderTimestamp: new Date(),
      };
      
      // Save to local state
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setCurrentOrder(newOrder);
      
      // Save orderId to localStorage for retrieval later
      localStorage.setItem('currentOrderId', docRef.id);
      
      return newOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
      });
      
      // Update in local state
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(prev => ({
          ...prev,
          orderStatus: newStatus,
        }));
      }
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get an order by ID - using useCallback to prevent unnecessary re-renders
  const getOrderById = useCallback(async (orderId) => {
    if (!orderId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Getting order by ID:", orderId);
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (orderDoc.exists()) {
        const orderData = {
          id: orderDoc.id,
          ...orderDoc.data(),
          orderTimestamp: orderDoc.data().orderTimestamp?.toDate() || new Date(),
        };
        
        setCurrentOrder(orderData);
        return orderData;
      } else {
        console.log("Order not found with ID:", orderId);
        setError('Order not found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get orders for current user - using useCallback
  const getUserOrders = useCallback(async (userEmail) => {
    if (!userEmail) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Getting orders for user:", userEmail);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userEmail', '==', userEmail),
        orderBy('orderTimestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      
      const userOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        orderTimestamp: doc.data().orderTimestamp?.toDate() || new Date(),
      }));
      
      setOrders(userOrders);
      console.log("Retrieved orders:", userOrders.length);
      return userOrders;
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError('Failed to fetch your orders. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get pending orders for current user - using useCallback
  const getPendingOrders = useCallback(async (userEmail) => {
    if (!userEmail) return [];
    
    try {
      const allOrders = await getUserOrders(userEmail);
      
      // Filter pending orders
      const pendingOrders = allOrders.filter(order => 
        order.orderStatus !== 'Ready for pickup' && 
        order.orderStatus !== 'Completed' &&
        order.orderStatus !== 'Cancelled'
      );
      
      console.log("Pending orders:", pendingOrders.length);
      return pendingOrders;
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      setError('Failed to fetch your pending orders. Please try again.');
      return [];
    }
  }, [getUserOrders]);

  // Check for current order in localStorage when component mounts
  useEffect(() => {
    const currentOrderId = localStorage.getItem('currentOrderId');
    if (currentOrderId) {
      getOrderById(currentOrderId).catch(console.error);
    }
  }, [getOrderById]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        loading,
        error,
        createOrder,
        getOrderById,
        updateOrderStatus,
        getUserOrders,
        getPendingOrders,
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};
