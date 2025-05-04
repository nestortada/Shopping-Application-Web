// src/components/LocationCard.jsx
import React from 'react'

export default function LocationCard({ imageSrc, title }) {
  return (
    <article className="w-full h-24 flex items-center bg-pink-100 shadow-md rounded-2xl overflow-hidden my-2">
      <figure className="w-1/3 h-full">
        <img src={imageSrc} alt={title} className="object-cover w-full h-full" />
      </figure>
      <div className="flex-1 flex items-center justify-center">
        <h2 className="font-paprika text-lg text-center">{title}</h2>
      </div>
    </article>
  )
}
