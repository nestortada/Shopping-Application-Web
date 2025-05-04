// src/components/BottomNav.jsx
import React from 'react'
import casaIcon from '../assets/casa.png'
import pedidoIcon from '../assets/pedido.png'
import promocionesIcon from '../assets/promociones.png'

export default function BottomNav({ active = 'home' }) {
  const items = [
    { id: 'home',       label: 'Restaurantes y cafés', icon: casaIcon },
    { id: 'orders',     label: 'Mis pedidos',          icon: pedidoIcon },
    { id: 'promotions', label: 'Promociones',          icon: promocionesIcon },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[83px] bg-[#3822B4] flex justify-around items-center">
      {items.map(({ id, label, icon }) => (
        <button key={id} className="flex flex-col items-center focus:outline-none">
          <span className={`
            w-[50px] h-[50px] rounded-full flex items-center justify-center
            ${active === id ? 'bg-[#7A5EF6]' : 'bg-[#7A5EF6]/80'}
          `}>
            <img src={icon} alt={label} className="w-6 h-6" />
          </span>
          <span className="mt-1 text-[10px] font-paprika text-white">{label}</span>
        </button>
      ))}
    </nav>
  )
}
