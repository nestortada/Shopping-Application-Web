// src/pages/MapPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../../components/SearchBar';
import ToggleButtons from '../../../components/ToggleButtons';
import LocationCard from '../../../components/LocationCard';
import MapView from '../../../components/MapView';
import BottomNav from '../../../components/BottomNav';
import cartIcon from '../../../assets/carrito.png';
import profileIcon from '../../../assets/usuario.png';
import logoutIcon from '../../../assets/logout.png';

export default function MapPage() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Restaurantes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const allLocations = [
    { id: '1', image: null, title: 'Mesón de La Sabana', type: 'Restaurantes' },
    { id: '2', image: null, title: 'Restaurante Escuela', type: 'Restaurantes' },
    { id: '3', image: null, title: 'Arcos de La Sabana', type: 'Cafés' },
  ];

  const visible = allLocations
    .filter((l) => l.type === filterType)
    .filter((l) => l.title.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <main className="relative w-full h-screen bg-[#FBFBFA] flex flex-col">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={() => setIsSidebarOpen(false)} // Cierra la sidebar al hacer clic en el fondo
        ></div>
      )}

      {/* Sidebar */}
      <section
        className={`fixed top-0 left-0 h-full w-64 bg-[#3F2EDA] shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-20`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 text-white text-2xl"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div className="p-4 text-white flex flex-col items-center">
          {/* Perfil */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={profileIcon}
              alt="Usuario"
              className="w-16 h-16 rounded-full mb-2"
            />
            <p className="text-sm font-bold">Saldo: $50.00</p>
            <p className="text-center text-sm">Nestor Andres Tabares David</p>
          </div>

          {/* Opciones */}
          <div className="flex flex-col space-y-2 w-full">
            <button
              onClick={() => navigate('/forgot')} // Redirige a la ruta '/forgot'
              className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm"
            >
              Cambiar contraseña
            </button>
            <button className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm">
              Mis tarjetas
            </button>
            <button className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm">
              Recargar saldo
            </button>
            <button className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm">
              Inventario
            </button>
            <button className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm">
              Mis favoritos
            </button>
            <button className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm">
              Mis calificaciones
            </button>
            <button className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm">
              Estados de los Pedidos
            </button>
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={() => {
              localStorage.clear(); // Limpia cualquier dato almacenado en localStorage
              navigate('/'); // Redirige al inicio
            }}
            className="w-full bg-[#2C1DBA] text-white py-2 rounded-md text-sm mt-6 flex items-center justify-center"
          >
            <img src={logoutIcon} alt="Cerrar sesión" className="w-5 h-5 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </section>

      {/* Contenedor principal con espaciado vertical */}
      <div className="flex flex-col space-y-4 overflow-y-auto pb-24 px-4 pt-4">
        {/* Barra superior con iconos */}
        <section className="bg-[#1D1981] shadow-md flex justify-between items-center px-2 py-3 rounded-md">
          <button onClick={() => setIsSidebarOpen(true)} aria-label="Perfil">
            <img src={profileIcon} alt="Perfil" className="w-10 h-10" />
          </button>
          <button onClick={() => console.log('Carrito')} aria-label="Carrito">
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

        {/* Mapa */}
        <section>
          <MapView />
        </section>

        {/* Lista de tarjetas */}
        <section className="space-y-2">
          {visible.map((loc) => (
            <LocationCard key={loc.id} imageSrc={loc.image} title={loc.title} />
          ))}
        </section>
      </div>

      {/* Navegación inferior fija */}
      <BottomNav active="home" />
    </main>
  );
}
