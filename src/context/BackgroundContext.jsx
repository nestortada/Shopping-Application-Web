import React, { createContext, useState, useContext } from 'react';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const [backgroundColor, setBackgroundColor] = useState('bg-white');

  const updateBackgroundColor = (routeId) => {
    switch (routeId) {
      case 'login':
        setBackgroundColor('bg-white');
        break;
      case 'map':
        setBackgroundColor('bg-gray-100');
        break;
      case 'forgot':
        setBackgroundColor('bg-yellow-50');
        break;
      case 'register':
        setBackgroundColor('bg-green-50');
        break;
      default:
        setBackgroundColor('bg-white');
    }
  };

  return (
    <BackgroundContext.Provider value={{ backgroundColor, updateBackgroundColor }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) throw new Error('useBackground must be used within BackgroundProvider');
  return context;
};
