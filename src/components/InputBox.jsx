import React from 'react';

export default function InputBox({ iconSrc, placeholder, type = 'text', value, onChange }) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 mb-4">
      <img src={iconSrc} alt="" className="w-6 h-6 mr-3 opacity-60" />
      <input
        type={type}
        className="flex-1 outline-none placeholder-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
