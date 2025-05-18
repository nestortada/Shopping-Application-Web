import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/toast.css';
import App from './App.jsx';
import { AuthProvider } from './auth/hook/auth-provider';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <OrderProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </OrderProvider>
    </AuthProvider>
  </StrictMode>
);
