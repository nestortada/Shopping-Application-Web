// src/pages/MapPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../../../components/SearchBar';
import ToggleButtons from '../../../components/ToggleButtons';
import LocationCard from '../../../components/LocationCard';
import MapView from '../../../components/MapView';
import BottomNav from '../../../components/BottomNav';
import UserDashboard from '../../../components/UserDashboard';
import NotificationBell from '../../../components/NotificationBell';
import cartIcon from '../../../assets/carrito.png';
import profileIcon from '../../../assets/usuario.png';
import Escuela from '../../../assets/escuela.png';
import Arcos from '../../../assets/arcos.png';
import Embarca from '../../../assets/embarca.png';
import Living from '../../../assets/living.png';
import Kioskos from '../../../assets/kioskos.png';
import Banderitas from '../../../assets/banderitas.png';
import Wok from '../../../assets/wok.png';
import PuntoVerde from '../../../assets/verde.png';
import PuntoCafe from '../../../assets/verde.png';
import Bolsa from '../../../assets/bolsa.png';
import CafeEmbarca from '../../../assets/cafeembarca.png';
import CafeEstudio from '../../../assets/estudio.png';
import CafeLetras from '../../../assets/letras.png';

export default function MapPage() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Restaurantes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [containerHeight, setContainerHeight] = useState(300);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
    { id: '1', image: PuntoCafe, title: 'Mesón de La Sabana', type: 'Restaurantes' },
    { id: '2', image: Escuela, title: 'Escuela', type: 'Restaurantes' },
    { id: '3', image: Arcos, title: 'Arcos', type: 'Restaurantes' },
    { id: '4', image: Embarca, title: 'Embarcadero', type: 'Restaurantes' },
    { id: '5', image: Living, title: 'TerrazaLiving', type: 'Restaurantes' },
    { id: '6', image: Kioskos, title: 'Kioskos', type: 'Restaurantes' },
    { id: '7', image: Banderitas, title: 'Banderitas', type: 'Restaurantes' },
    { id: '8', image: Wok, title: 'PuntoWok', type: 'Restaurantes' },
    { id: '9', image: PuntoVerde, title: 'Punto-Verde', type: 'Restaurantes' },
    { id: '10', image: Bolsa, title: 'Cafe-Bolsa', type: 'Cafés' },
    { id: '11', image: CafeEmbarca, title: 'Embarcadero', type: 'Cafés' },
    { id: '12', image: CafeEstudio, title: 'Estudio', type: 'Cafés' },
    { id: '13', image: CafeLetras, title: 'Letras', type: 'Cafés' },
    { id: '14', image: PuntoCafe, title: 'Punto-cafe', type: 'Cafés' },
  ];
  const visible = allLocations
    .filter((l) => l.type === filterType)
    .filter((l) => l.title.toLowerCase().includes(searchText.toLowerCase()));
  // Efecto para manejar el cambio de tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      // Ajusta el alto del contenedor si la ventana cambia de tamaño
      const maxHeight = window.innerHeight * 0.7;
      if (containerHeight > maxHeight) {
        setContainerHeight(maxHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Actualizamos el estado de pantalla completa basado en el containerHeight
    setIsFullScreen(containerHeight > window.innerHeight * 0.5);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerHeight]);

  return (
    <main className="relative w-full h-screen bg-[#FBFBFA] flex flex-col">
      {/* Sidebar with UserDashboard */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <section
        className={`fixed top-0 left-0 h-full w-64 bg-[#3F2EDA] shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50`}
        aria-hidden={!isSidebarOpen}
        aria-label="User dashboard"
      >
        <UserDashboard onClose={() => setIsSidebarOpen(false)} />
      </section>

      {/* Contenedor principal con espaciado vertical */}
      <div className="flex flex-col space-y-4 overflow-y-auto pb-24 px-4 pt-4">        {/* Barra superior con iconos */}
        <section className="bg-[#3822B4] shadow-md flex justify-between items-center px-2 py-3 rounded-md">
          <button onClick={() => setIsSidebarOpen(true)} aria-label="Perfil">
            <img src={profileIcon} alt="Perfil" className="w-10 h-10" />
          </button>
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <button 
              onClick={() => navigate('/cart')}
              aria-label="Carrito"
            >
              <img src={cartIcon} alt="Carrito" className="w-10 h-10" />
            </button>
          </div>
        </section>

        {/* Buscador */}
        <section>
          <SearchBar
            placeholder="Buscar restaurantes o cafés"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </section>        {/* Toggle Restaurantes / Cafés */}
        <section>
          <ToggleButtons
            leftLabel="Restaurantes"
            rightLabel="Cafés"
            onToggle={(type) => {
              // Efecto suave al cambiar de tipo
              setFilterType(type);
              // Contraer ligeramente el panel al cambiar de categoría para mejor experiencia visual
              if (containerHeight > 400) {
                setContainerHeight(containerHeight - 50);
              }
            }}
          />
        </section>        {/* Mapa con altura dinámica */}
        <motion.section 
          className="flex justify-center"
          animate={{
            opacity: isFullScreen ? 0.6 : 1,  // Reduce la opacidad del mapa cuando el panel está expandido
            height: isFullScreen ? "30vh" : "40vh",  // Ajusta la altura del mapa según el estado del panel
          }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="w-[1500px] rounded-lg overflow-hidden"
          >
            <MapView />
          </div>
        </motion.section>{/* Control de arrastre con Framer Motion */}
        <motion.div
          className="w-full h-5 bg-gray-200 rounded-full cursor-ns-resize flex items-center justify-center hover:bg-gray-300 transition-colors"
          whileTap={{ scale: 1.05 }}
          whileHover={{ backgroundColor: "#d1d5db" }}
          onClick={() => {
            // Alternar entre tamaño normal y pantalla completa
            if (isFullScreen) {
              setContainerHeight(300);
              setIsFullScreen(false);
            } else {
              setContainerHeight(window.innerHeight * 0.7);
              setIsFullScreen(true);
            }
          }}
        >
          <div className="w-20 h-1 bg-[#3F2EDA] rounded-full"></div>
          {/* Indicador de dirección para expandir/contraer */}
          <div className="absolute right-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-[#3F2EDA] transition-transform ${isFullScreen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFullScreen ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
            </svg>
          </div>
        </motion.div>
        
        {/* Lista de tarjetas con scroll usando Framer Motion */}        <motion.section
          ref={dragRef}
          initial={{ height: 300 }}
          animate={{ 
            height: containerHeight,
            transition: { 
              type: "spring", 
              damping: 25, 
              stiffness: 250 
            }
          }}
          className="flex-1 min-h-0"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            // Si el usuario arrastra significativamente hacia abajo, colapsamos
            if (info.offset.y > 100) {
              setContainerHeight(100);
              setIsFullScreen(false);
            } 
            // Si el usuario arrastra significativamente hacia arriba, expandimos
            else if (info.offset.y < -100) {
              setContainerHeight(window.innerHeight * 0.7);
              setIsFullScreen(true);
            } 
            // Si es un arrastre pequeño, ajustar el tamaño proporcionalmente
            else {
              const newHeight = containerHeight - info.offset.y;
              const minHeight = 100;
              const maxHeight = window.innerHeight * 0.7;
              const finalHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
              setContainerHeight(finalHeight);
              setIsFullScreen(finalHeight > window.innerHeight * 0.5);
            }
          }}
        >
          <div className="h-full overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[#3F2EDA] scrollbar-track-gray-200">
            <AnimatePresence mode="popLayout">
              {visible.map((loc, index) => (
                <motion.div
                  key={loc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      delay: index * 0.05,  // Efecto escalonado 
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -20,
                    transition: { duration: 0.2 } 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-2"
                >
                  <LocationCard 
                    id={loc.id} 
                    imageSrc={loc.image} 
                    title={loc.title} 
                    onClick={handleLocationClick}
                  />
                </motion.div>
              ))}
              {visible.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  No se encontraron ubicaciones
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>

      {/* Navegación inferior fija */}
      <BottomNav active="home" />
    </main>
  );
}
