// src/pages/MapPage.jsx
import React, { useState } from 'react'
import SearchBar      from '../../../components/SearchBar'
import ToggleButtons  from '../../../components/ToggleButtons'
import LocationCard   from '../../../components/LocationCard'
import MapView        from '../../../components/MapView'
import BottomNav      from '../../../components/BottomNav'


export default function MapPage() {
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('Restaurantes')

  const allLocations = [
    { id: '1', image: null ,   title: 'Mesón de La Sabana',    type: 'Restaurantes' },
    { id: '2', image: null, title: 'Restaurante Escuela',   type: 'Restaurantes' },
    { id: '3', image: null,   title: 'Arcos de La Sabana',    type: 'Cafés' },
    // … añade más si quieres
  ]

  const visible = allLocations
    .filter(l => l.type === filterType)
    .filter(l => l.title.toLowerCase().includes(searchText.toLowerCase()))

  return (
    <main className="relative w-full h-screen bg-[#FBFBFA] overflow-hidden">
      {/* Buscador */}
      <section className="absolute top-6 left-0 right-0 px-4">
        <SearchBar
          placeholder="Buscar restaurantes o cafés"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </section>

      {/* Toggle Restaurantes / Cafés */}
      <section className="absolute top-20 left-0 right-0 px-4">
        <ToggleButtons
          leftLabel="Restaurantes"
          rightLabel="Cafés"
          onToggle={setFilterType}
        />
      </section>

      {/* Mapa */}
      <section className="absolute top-36 left-0 right-0 px-0">
        <MapView />
      </section>

      {/* Lista de tarjetas */}
      <section className="absolute top-[364px] left-0 right-0 px-4 overflow-y-auto pb-24">
        {visible.map(loc => (
          <LocationCard
            key={loc.id}
            imageSrc={loc.image}
            title={loc.title}
          />
        ))}
      </section>

      {/* Navegación inferior */}
      <BottomNav active="home" />
    </main>
  )
}
