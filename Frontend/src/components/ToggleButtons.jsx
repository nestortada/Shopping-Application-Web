// src/components/ToggleButtons.jsx
import React, { useState } from 'react'

export default function ToggleButtons({ leftLabel, rightLabel, onToggle }) {
  const [selected, setSelected] = useState(leftLabel)

  function handleClick(label) {
    setSelected(label)
    onToggle?.(label)
  }

  return (
    <div className="flex w-full h-9 bg-white border border-gray-300 rounded-lg overflow-hidden">
      {[leftLabel, rightLabel].map(label => (
        <button
          key={label}
          onClick={() => handleClick(label)}
          className={`
            flex-1 flex items-center justify-center text-sm font-medium transition-colors
            ${selected === label
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600'}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
