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
        <Routes>
          {routes.map(route => (
            <Route
              key={route.id}
              path={route.path}
              element={<route.component />}
            />
          ))}
          <Route path="/redirect" element={<RedirectHandler />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  // Usamos la misma base que en vite.config.js
  const basename = import.meta.env.VITE_BASE_PATH || '/Shopping-Application-Web/';

  return (
    <Router basename={basename}>
      <BackgroundProvider>
        <AppContent />
      </BackgroundProvider>
    </Router>
  );
}