// src/App.jsx
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { routes } from './config/routes';
import { BackgroundProvider, useBackground } from './context/BackgroundContext';
import RedirectHandler from './pages/RedirectHandler';
import {Navigate} from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { AnimatePresence, motion } from 'framer-motion';
import { CardProvider } from './context/CardContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { backgroundColor, updateBackgroundColor } = useBackground();
  const location = useLocation();

  useEffect(() => {
    const current = routes.find(r => r.path === location.pathname);
    updateBackgroundColor(current?.id);
  }, [location.pathname, updateBackgroundColor]);

  return (
    <div className={twMerge('flex flex-col min-h-screen', backgroundColor)}>
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {routes.map(route => (
              <Route
                key={route.id}
                path={route.path}
                element={
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <route.component />
                  </motion.div>
                }
              />
            ))}
            <Route path="/redirect" element={<RedirectHandler />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  // Usamos la misma base que en vite.config.js
  const basename = import.meta.env.VITE_BASE_PATH || '/Shopping-Application-Web/';  return (
    <Router basename={basename}>
      <BackgroundProvider>
        <CardProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppContent />
              <Toaster 
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                    success: {
                      duration: 3000,
                      style: {
                        background: '#1D1981',
                      },
                    },
                    error: {
                      duration: 5000,
                      style: {
                        background: '#d73838',
                      },                  },
                }}
              />
            </FavoritesProvider>
          </CartProvider>
        </CardProvider>
      </BackgroundProvider>
    </Router>
  );
}