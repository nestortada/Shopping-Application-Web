// api/routes/notification.js
import express from 'express';
import { 
  emitNewOrderNotification,
  emitLowStockNotification,
  emitOrderStatusNotification,
  emitFavoriteProductUpdateNotification
} from '../controllers/notificationController.js';

export default function() {
  const router = express.Router();
  
  // Test notification endpoint
  router.post('/test', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (!type || !data) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters (type, data)' 
        });
      }
      
      let result = false;
      
      switch (type) {
        case 'order':
          result = emitNewOrderNotification(data);
          break;
        case 'stock':
          result = emitLowStockNotification(data.product, data.locationId);
          break;
        case 'order_status':
          result = emitOrderStatusNotification(data.order, data.status);
          break;
        case 'favorite_product':
          result = emitFavoriteProductUpdateNotification(data.product, data.updateType, data.locationId);
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: `Invalid notification type: ${type}` 
          });
      }
      
      if (result) {
        return res.status(200).json({ 
          success: true, 
          message: `Test ${type} notification sent successfully` 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send test notification' 
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred' 
      });
    }
  });
  
  return router;
}
