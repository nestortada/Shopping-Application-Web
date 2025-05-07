// src/components/MapView.jsx
import React from 'react'

export default function MapView() {
  return (
    <div className="w-full h-[280px] rounded-lg overflow-hidden">
      <iframe
        src="https://www.unisabana.edu.co/tour-virtual/"
        title="Tour Virtual Universidad de La Sabana"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
      />
    </div>
  )
}
