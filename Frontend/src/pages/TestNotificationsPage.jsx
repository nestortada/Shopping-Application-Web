import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  successToast,
  errorToast,
  infoToast,
  warningToast,
  newOrderToast,
  lowStockToast,
  orderStatusToast,
  favoriteProductUpdateToast 
} from '../utils/toastUtils';

const TestNotificationsPage = () => {
  const { socketConnected, addNotification } = useNotifications();
  const [notificationType, setNotificationType] = useState('order');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  
  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const notificationTemplates = {
    order: {
      locationId: 'kioskos',
      locationName: 'Kioskos',
      orderNumber: '1234',
      id: Date.now().toString(),
      userEmail: localStorage.getItem('userEmail')
    },
    stock: {
      product: {
        id: 'prod123',
        nombre: 'Café Americano',
        name: 'Café Americano',
        stock: 3
      },
      locationId: 'kioskos'
    },
    order_status: {
      order: {
        id: 'order456',
        orderNumber: '456',
        locationName: 'Kioskos',
        locationId: 'kioskos',
        userEmail: localStorage.getItem('userEmail')
      },
      status: 'Ready for pickup'
    },
    favorite_product: {
      product: {
        id: 'prod789',
        nombre: 'Croissant de Almendras',
        name: 'Croissant de Almendras'
      },
      updateType: 'stock',
      locationId: 'kioskos'
    },
    // Added simple toast types
    success: {
      message: 'Operation completed successfully!'
    },
    error: {
      message: 'Something went wrong!'
    },
    info: {
      message: 'Here is some information for you'
    },    warning: {
      message: 'Please be careful with this action'
    }
  };
    // Direct toast function without API call
  const showDirectToast = (type) => {
    const template = notificationTemplates[type];
    
    switch (type) {
      case 'success':
        successToast(template.message);
        break;
      case 'error':
        errorToast(template.message);
        break;
      case 'info':
        infoToast(template.message);
        break;
      case 'warning':
        warningToast(template.message);
        break;
      case 'order':
        newOrderToast(template.locationName);
        break;
      case 'stock':
        lowStockToast(template.product.name);
        break;
      case 'order_status':
        orderStatusToast(template.status, template.order.orderNumber);
        break;
      case 'favorite_product':
        favoriteProductUpdateToast(template.product.name);
        break;
      default:
        infoToast('Unknown notification type');
    }
  };
  
  // Full notification function with API and Firestore
  const sendTestNotification = async () => {
    try {
      setSending(true);
      setResult(null);
      
      // Show toast directly
      showDirectToast(notificationType);
      
      // For simulating both toast and Firestore storage in one step:
      if (notificationType === 'order') {
        // Example of using addNotification context function directly
        await addNotification({
          userEmail: localStorage.getItem('userEmail'),
          message: `New order received for ${notificationTemplates.order.locationName}`,
          type: 'order',
          orderId: notificationTemplates.order.id,
          locationId: notificationTemplates.order.locationId,
          meta: { order: notificationTemplates.order },
          disableToast: true // Since we already showed the toast directly
        });
      }
      
      // Optional: Also send to backend API if it's set up
      try {
        const response = await fetch(`${API_URL}/api/v1/notifications/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notificationType,
            data: notificationTemplates[notificationType]
          })
        });
        
        const data = await response.json();
        
        setResult({
          success: data.success,
          message: data.message
        });
      } catch (apiError) {
        console.log('API call skipped or failed, but toast was shown:', apiError);
        setResult({
          success: true,
          message: 'Toast notification shown (API call skipped)'
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setResult({
        success: false,
        message: error.message || 'An error occurred'
      });
      errorToast('Failed to send notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };
    return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-[#3F2EDA]">Notification System Test Page</h1>
      <p className="mb-4 text-gray-600">This page lets you test different types of toast notifications and see how they appear in your notifications area.</p>
      
      <div className="mb-4 p-3 rounded bg-gray-50 border flex items-center">
        <div className="mr-3">Socket.IO Status:</div>
        {socketConnected ? (
          <div className="flex items-center text-green-600">
            <span className="h-3 w-3 bg-green-500 rounded-full mr-1"></span>
            Connected
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <span className="h-3 w-3 bg-red-500 rounded-full mr-1"></span>
            Disconnected
          </div>
        )}
      </div>
        <div className="mb-4">
        <label className="block mb-2">Notification Type:</label>
        <select 
          value={notificationType}
          onChange={(e) => setNotificationType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <optgroup label="System Notifications">
            <option value="order">New Order</option>
            <option value="stock">Low Stock</option>
            <option value="order_status">Order Status Update</option>
            <option value="favorite_product">Favorite Product Update</option>
          </optgroup>
          <optgroup label="Basic Toast Types">
            <option value="success">Success Toast</option>
            <option value="error">Error Toast</option>
            <option value="info">Info Toast</option>
            <option value="warning">Warning Toast</option>
          </optgroup>
        </select>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Notification Data:</h3>
        <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
          {JSON.stringify(notificationTemplates[notificationType], null, 2)}
        </pre>
      </div>
        <button
        onClick={sendTestNotification}
        disabled={sending}
        className="bg-[#3F2EDA] text-white py-2 px-4 rounded disabled:bg-gray-400 hover:bg-[#2C1DBA] transition-colors"
      >
        {sending ? 'Sending...' : 'Send Notification'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
        <div className="mt-8 bg-gray-50 p-4 rounded border">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal pl-4 space-y-2">
          <li>Select the type of notification you want to test</li>
          <li>Click the "Send Notification" button to show a toast and store it in your notifications</li>
          <li>The toast will appear briefly and then can be viewed in the notification bell ↗️</li>
          <li>Toast notifications will show for 5 seconds and then automatically dismiss</li>
          <li>All notifications are saved in your account and can be viewed anytime</li>
        </ol>
        
        <div className="mt-4">
          <h4 className="font-medium">About Toast Types:</h4>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
            <li><strong>System Notifications:</strong> These will show a toast and also be stored in the notifications bell</li>
            <li><strong>Basic Toasts:</strong> These are simple toast messages without persistent storage</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => showDirectToast('success')}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
        >
          Success Toast
        </button>
        <button
          onClick={() => showDirectToast('error')}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Error Toast
        </button>
        <button
          onClick={() => showDirectToast('info')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Info Toast
        </button>
        <button
          onClick={() => showDirectToast('warning')}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
        >
          Warning Toast
        </button>
      </div>
    </div>
  );
};

export default TestNotificationsPage;
