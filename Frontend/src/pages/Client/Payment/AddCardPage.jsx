import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardContext } from '../../../context/CardContext';
import cardIcon from '../../../assets/tarjeta.png';

export default function AddCardPage() {
  const navigate = useNavigate();
  const { addCard } = useCardContext(); // Obtener la función para agregar tarjetas
  const [formData, setFormData] = useState({
    type: 'Visa', // Puedes cambiar esto según el tipo de tarjeta
    last4: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const last4 = formData.number.slice(-4); // Obtener los últimos 4 dígitos del número de tarjeta
    addCard({ ...formData, last4 });
    navigate('/cards'); // Regresar a la pantalla de "Mis tarjetas"
  };

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFA]">
      {/* Header */}
      <header className="bg-[#3822B4] text-white flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-2xl font-bold">←</button>
        <h1 className="flex-1 text-center text-lg font-bold">Información de pago</h1>
      </header>

      {/* Formulario */}
      <main className="flex-1 p-4">
        <form onSubmit={handleAddCard} className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Número de la tarjeta</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <img src={cardIcon} alt="Tarjeta" className="w-6 h-6 mr-2" />
              <input
                type="text"
                name="number"
                placeholder="1234 5678 9012 3456"
                className="flex-1 outline-none text-gray-700"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Fecha de vencimiento</label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                className="w-full border rounded-lg px-3 py-2 outline-none text-gray-700"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">CVV</label>
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                className="w-full border rounded-lg px-3 py-2 outline-none text-gray-700"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Titular de la tarjeta</label>
            <input
              type="text"
              name="holder"
              placeholder="Nombre del titular"
              className="w-full border rounded-lg px-3 py-2 outline-none text-gray-700"
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0E2F55] text-white py-2 rounded-lg text-lg font-bold"
          >
            Agregar tarjeta
          </button>
        </form>
      </main>
    </div>
  );
}