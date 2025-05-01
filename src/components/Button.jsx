import React from 'react';

export default function Button({ color = 'bg-blue-600', text, onClick }) {
  return (
    <button
      className={`${color} text-white py-2 px-6 rounded-lg shadow hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}