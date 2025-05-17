// src/pages/MapPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../../components/SearchBar';
import ToggleButtons from '../../../components/ToggleButtons';
import LocationCard from '../../../components/LocationCard';
import MapView from '../../../components/MapView';
import BottomNav from '../../../components/BottomNav';
import UserDashboard from '../../../components/UserDashboard';
import cartIcon from '../../../assets/carrito.png';
import profileIcon from '../../../assets/usuario.png';

export default function MapPage() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Restaurantes');  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [containerHeight, setContainerHeight] = useState(300);
  const dragRef = useRef(null);
  const navigate = useNavigate();
    // Function to handle location card clicks
  const handleLocationClick = (id, title) => {
    // Convert location title to a collection name (lowercase, no spaces)
    let collectionId = title.toLowerCase().replace(/\s+/g, '');
    
    // Special case for Mesón de La Sabana
    if (title === 'Mesón de La Sabana') {
      collectionId = 'meson';
    }
    
    // Guardar el ID de la ubicación en localStorage para su uso en CartPage
    localStorage.setItem('selectedLocationId', collectionId);
    console.log('Guardado en localStorage - selectedLocationId:', collectionId);
    
    // Navigate to products page with location info
    navigate('/products', { 
      state: { 
        locationId: collectionId,
        locationTitle: title
      } 
    });
  };

  const allLocations = [
    { id: '1', image: null, title: 'Mesón de La Sabana', type: 'Restaurantes' },
    { id: '2', image: null, title: 'Escuela', type: 'Restaurantes' },
    { id: '3', image: null, title: 'Arcos', type: 'Cafés' }
  ];

  const visible = allLocations
    .filter((l) => l.type === filterType)
    .filter((l) => l.title.toLowerCase().includes(searchText.toLowerCase()));

  // Control de arrastre
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const container = dragRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newHeight = window.innerHeight - e.clientY;
      
      // Limitar la altura entre 100px y 70% de la altura de la ventana
      const minHeight = 100;
      const maxHeight = window.innerHeight * 0.7;
      
      setContainerHeight(Math.min(Math.max(newHeight, minHeight), maxHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <main className="relative w-full h-screen bg-[#FBFBFA] flex flex-col">
      {/* Sidebar with UserDashboard */}
      <section
        className={`fixed top-0 left-0 h-full w-64 shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-20`}
      >
        <UserDashboard onClose={() => setIsSidebarOpen(false)} />
      </section>

      {/* Contenedor principal con espaciado vertical */}
      <div className="flex flex-col space-y-4 overflow-y-auto pb-24 px-4 pt-4">
        {/* Barra superior con iconos */}        <section className="bg-[#1D1981] shadow-md flex justify-between items-center px-2 py-3 rounded-md">
          <button onClick={() => setIsSidebarOpen(true)} aria-label="Perfil">
            <img src={profileIcon} alt="Perfil" className="w-10 h-10" />
          </button>
          <button onClick={() => navigate('/cart')} aria-label="Carrito">
            <img src={cartIcon} alt="Carrito" className="w-10 h-10" />
          </button>
        </section>

        {/* Buscador */}
        <section>
          <SearchBar
            placeholder="Buscar restaurantes o cafés"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </section>

        {/* Toggle Restaurantes / Cafés */}
        <section>
          <ToggleButtons
            leftLabel="Restaurantes"
            rightLabel="Cafés"
            onToggle={setFilterType}
          />
        </section>

        {/* Mapa con altura dinámica */}
        <section className="flex justify-center">
          <div 
            className="w-[350px] rounded-lg overflow-hidden"
            style={{ height: `calc(100vh - ${containerHeight}px - 200px)` }}
          >
            <MapView />
          </div>
        </section>

        {/* Control de arrastre */}
        <div
          className="w-full h-2 bg-gray-200 rounded-full cursor-ns-resize flex items-center justify-center hover:bg-gray-300 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="w-20 h-1 bg-[#3F2EDA] rounded-full"></div>
        </div>        {/* Lista de tarjetas con scroll */}
        <section
          ref={dragRef}
          style={{ height: `${containerHeight}px` }}
          className="flex-1 min-h-0 transition-all duration-200 ease-in-out"
        >
          <div className="h-full overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[#3F2EDA] scrollbar-track-gray-200">
            {visible.map((loc) => (
              <LocationCard 
                key={loc.id} 
                id={loc.id} 
                imageSrc={loc.image} 
                title={loc.title} 
                onClick={handleLocationClick}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Navegación inferior fija */}
      <BottomNav active="home" />
    </main>
  );
}
