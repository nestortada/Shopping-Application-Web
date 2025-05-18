import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const TestNotificationsPage = () => {
  const { socketConnected } = useNotifications();
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
    }
  };
  
  const sendTestNotification = async () => {
    try {
      setSending(true);
      setResult(null);
      
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
    } catch (error) {
      console.error('Error sending test notification:', error);
      setResult({
        success: false,
        message: error.message || 'An error occurred'
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test Real-Time Notifications</h1>
      
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
          <option value="order">New Order</option>
          <option value="stock">Low Stock</option>
          <option value="order_status">Order Status Update</option>
          <option value="favorite_product">Favorite Product Update</option>
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
        disabled={sending || !socketConnected}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
      >
        {sending ? 'Sending...' : 'Send Test Notification'}
      </button>
      
      {!socketConnected && (
        <p className="text-red-500 mt-2">
          Socket.IO connection required to send test notifications.
        </p>
      )}
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
      
      <div className="mt-8 bg-gray-50 p-4 rounded border">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal pl-4 space-y-2">
          <li>Make sure Socket.IO is connected (green status indicator)</li>
          <li>Select the type of notification you want to test</li>
          <li>Click the "Send Test Notification" button</li>
          <li>Look for the notification in the bell icon at the top of the page</li>
          <li>Try swiping notifications left to right to delete them</li>
        </ol>
      </div>
    </div>
  );
};

export default TestNotificationsPage;
