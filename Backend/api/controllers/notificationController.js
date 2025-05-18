// api/controllers/notificationController.js
import { notificationsNamespace } from '../../server.js';

// Helper function to emit notifications through Socket.IO
export const emitNotification = (recipient, notificationData) => {
  try {
    // If recipient is a specific user email
    if (recipient.includes('@')) {
      notificationsNamespace.to(recipient).emit('newNotification', notificationData);
    } 
    // If recipient is a location room
    else if (recipient.startsWith('location-')) {
      notificationsNamespace.to(recipient).emit('newNotification', notificationData);
    }
    
    console.log(`Notification emitted to ${recipient}:`, notificationData);
    return true;
  } catch (error) {
    console.error('Error emitting notification:', error);
    return false;
  }
};

// Function to emit new order notification
export const emitNewOrderNotification = (order) => {
  const { locationId, locationName, orderNumber, id } = order;
  
  // Prepare notification data
  const notificationData = {
    id: id || Date.now().toString(),
    type: 'order',
    message: `New order #${orderNumber || id} received from ${locationName}`,
    timestamp: new Date(),
    orderId: id,
    locationId,
    meta: { order }
  };
  
  // Emit to location room
  return emitNotification(`location-${locationId}`, notificationData);
};

// Function to emit low stock notification
export const emitLowStockNotification = (product, locationId) => {
  // Prepare notification data
  const notificationData = {
    id: Date.now().toString(),
    type: 'stock',
    message: `⚠️ Product ${product.nombre || product.name} is running low on stock (${product.stock} left)`,
    timestamp: new Date(),
    productId: product.id,
    locationId,
    meta: { product }
  };
  
  // Emit to location room
  return emitNotification(`location-${locationId}`, notificationData);
};

// Function to emit order status change notification
export const emitOrderStatusNotification = (order, newStatus) => {
  const { id, orderNumber, locationName, userEmail, locationId } = order;
  
  // Prepare notification data for customer
  if (userEmail) {
    let message = '';
    
    if (newStatus === 'In preparation') {
      message = `Your order at ${locationName || 'the restaurant'} is now being prepared.`;
    } else if (newStatus === 'Ready for pickup') {
      message = `Your order at ${locationName || 'the restaurant'} is ready for pickup!`;
    } else {
      message = `Your order #${orderNumber || id} status has been updated to "${newStatus}".`;
    }
    
    const customerNotification = {
      id: `${id}-${Date.now()}`,
      type: 'order_status',
      message,
      timestamp: new Date(),
      orderId: id,
      locationId,
      status: newStatus,
      meta: { order }
    };
    
    // Emit to customer
    emitNotification(userEmail, customerNotification);
  }
  
  // Prepare notification data for POS user
  const posNotification = {
    id: `${id}-pos-${Date.now()}`,
    type: 'order_status',
    message: `Order #${orderNumber || id} has been updated to "${newStatus}".`,
    timestamp: new Date(),
    orderId: id,
    locationId,
    status: newStatus,
    meta: { order }
  };
  
  // Emit to location room
  return emitNotification(`location-${locationId}`, posNotification);
};

// Function to emit favorite product update notification
export const emitFavoriteProductUpdateNotification = (product, updateType, locationId) => {
  let message = '';
  if (updateType === 'stock') {
    message = `Your favorite product ${product.nombre || product.name} has been restocked.`;
  } else if (updateType === 'details') {
    message = `Your favorite product ${product.nombre || product.name} has been updated.`;
  }
  
  // Prepare notification data
  const notificationData = {
    id: Date.now().toString(),
    type: 'favorite_product',
    message,
    timestamp: new Date(),
    productId: product.id,
    locationId,
    meta: { product }
  };
  
  // In a real app, you would query for all users who have favorited this product
  // For simplicity, we're emitting to the location room
  return emitNotification(`location-${locationId}`, notificationData);
};
