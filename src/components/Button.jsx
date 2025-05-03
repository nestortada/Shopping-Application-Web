// src/components/Button.jsx
import React from 'react';

export default function Button({ color = 'bg-blue-600', text, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} py-2 px-6 rounded-lg shadow border border-transparent transition-all hover:opacity-90 hover:border-2 hover:border-dotted hover:border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white cursor-pointer`} // ← aquí
    >
      {text}
    </button>
  );
}
