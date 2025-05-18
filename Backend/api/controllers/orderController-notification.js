// api/controllers/orderController.js - Order Status Update Function to integrate with notifications

import { 
  emitOrderStatusNotification,
  emitNewOrderNotification
} from './notificationController.js';

/**
 * Updates order status and sends notifications
 */
export async function updateOrderStatus(req, res) {
  try {
    const { orderId, status } = req.body;
    const { db } = req.app.locals;
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID and status are required' 
      });
    }
    
    // Get order collection
    const ordersCollection = db.collection('orders');
    
    // Find the order
    const order = await ordersCollection.findOne({ _id: orderId });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Update order status
    const result = await ordersCollection.updateOne(
      { _id: orderId },
      { $set: { status: status, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to update order status or status already set' 
      });
    }
    
    // Send notification about status change
    emitOrderStatusNotification(order, status);
    
    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: {
        id: order._id,
        status: status
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while updating order status'
    });
  }
}

/**
 * Creates a new order and sends notifications
 */
export async function createOrderWithNotification(orderData) {
  try {
    // Create the order in database
    // This is a placeholder for your actual order creation logic
    
    // Send notification about new order
    emitNewOrderNotification(orderData);
    
    return {
      success: true,
      message: 'Order created and notification sent',
      order: orderData
    };
  } catch (error) {
    console.error('Error creating order with notification:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating order'
    };
  }
}
