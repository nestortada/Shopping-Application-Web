import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { routes } from './config/routes';
import { BackgroundProvider, useBackground } from './context/BackgroundContext';
import { twMerge } from 'tailwind-merge';

function AppContent() {
  const { backgroundColor, updateBackgroundColor } = useBackground();
  const location = useLocation();

  useEffect(() => {
    const current = routes.find(r => r.path === location.pathname);
    updateBackgroundColor(current?.id);
  }, [location.pathname, updateBackgroundColor]);

  return (
    <div className={twMerge('flex flex-col min-h-screen', backgroundColor)}>
        <Routes>
          {routes.map(route => (
            <Route key={route.id} path={route.path} element={<route.component />} />
          ))}
        </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <BackgroundProvider>
        <AppContent />
      </BackgroundProvider>
    </Router>
  );
}
