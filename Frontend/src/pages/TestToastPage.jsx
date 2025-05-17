// src/pages/TestToastPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  successToast, 
  errorToast, 
  infoToast, 
  warningToast,
  newOrderToast,
  lowStockToast,
  orderStatusToast,
  favoriteProductUpdateToast
} from '../utils/toastUtils.jsx';

export default function TestToastPage() {
  const navigate = useNavigate();

  const showSuccessToast = () => {
    successToast('This is a success toast!');
  };

  const showErrorToast = () => {
    errorToast('This is an error toast!');
  };

  const showInfoToast = () => {
    infoToast('This is an info toast!');
  };

  const showWarningToast = () => {
    warningToast('This is a warning toast!');
  };

  const showNewOrderToast = () => {
    newOrderToast('Test Restaurant');
  };

  const showLowStockToast = () => {
    lowStockToast('Coffee');
  };

  const showOrderStatusToast = () => {
    orderStatusToast('ready', '12345');
  };

  const showFavoriteProductUpdateToast = () => {
    favoriteProductUpdateToast('Hamburger');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">Test Toast Notifications</h1>
      
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <button 
          onClick={showSuccessToast}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Show Success Toast
        </button>
        
        <button 
          onClick={showErrorToast}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Show Error Toast
        </button>
        
        <button 
          onClick={showInfoToast}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Show Info Toast
        </button>
        
        <button 
          onClick={showWarningToast}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
        >
          Show Warning Toast
        </button>
        
        <button 
          onClick={showNewOrderToast}
          className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
        >
          Show New Order Toast
        </button>
        
        <button 
          onClick={showLowStockToast}
          className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
        >
          Show Low Stock Toast
        </button>
        
        <button 
          onClick={showOrderStatusToast}
          className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600"
        >
          Show Order Status Toast
        </button>
        
        <button 
          onClick={showFavoriteProductUpdateToast}
          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Show Favorite Product Update Toast
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mt-8"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
