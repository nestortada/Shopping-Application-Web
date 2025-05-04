// src/components/SearchBar.jsx
import React from 'react'
import lupaIcon from '../assets/lupa.png'

export default function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="w-full relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-9 px-12 rounded-lg border border-gray-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 "
      />
      <img
        src={lupaIcon}
        alt="Buscar"
        className="w-6 h-6 absolute left-3 top-1.5 transform scale-x-[-1]"
      />
    </div>
  )
}
