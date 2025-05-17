import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardContext } from '../../../context/CardContext';
import cardIcon from '../../../assets/tarjeta.png';

export default function AddCardPage() {
  const navigate = useNavigate();
  const { addCard, isCardManagementAllowed } = useCardContext(); // Obtener funciones del contexto
  const [formData, setFormData] = useState({
    type: 'crédito', // Por defecto es tarjeta de crédito
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  // Verificar si el usuario puede acceder a esta funcionalidad
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const allowed = isCardManagementAllowed(userEmail);
    setIsAllowed(allowed);
    
    if (!allowed) {
      setError('No tienes permiso para gestionar tarjetas. Esta funcionalidad es solo para clientes.');
    }
  }, [isCardManagementAllowed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas para cada campo
    if (name === 'number') {
      // Solo permitir dígitos y limitar a 16 caracteres
      const formattedValue = value.replace(/\D/g, '').slice(0, 16);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expiry') {
      // Formatear MM/YY automáticamente
      const formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(\d{1,2})/, '$1/$2');
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'cvv') {
      // Solo permitir dígitos y limitar a 3-4 caracteres
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Validar número de tarjeta (debe tener 16 dígitos)
    if (formData.number.length !== 16) {
      setError('El número de tarjeta debe tener 16 dígitos');
      return false;
    }
    
    // Validar fecha de expiración (formato MM/YY y fecha futura)
    const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryPattern.test(formData.expiry)) {
      setError('La fecha de expiración debe tener formato MM/YY');
      return false;
    }
    
    // Validar que la fecha no esté expirada
    const [month, year] = formData.expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    if (expiryDate <= currentDate) {
      setError('La tarjeta ha expirado');
      return false;
    }
    
    // Validar CVV (3-4 dígitos)
    if (formData.cvv.length < 3) {
      setError('El CVV debe tener al menos 3 dígitos');
      return false;
    }
    
    // Validar nombre del titular
    if (formData.holder.trim().length < 3) {
      setError('Por favor ingresa el nombre completo del titular');
      return false;
    }
    
    return true;
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    
    if (!isAllowed) {
      setError('No tienes permiso para gestionar tarjetas');
      return;
    }
    
    setError(null);
    
    // Validar el formulario
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Llamar a la función para agregar la tarjeta
      const result = await addCard(formData);
      
      if (result && result.success) {
        navigate('/cards'); // Regresar a la pantalla de "Mis tarjetas"
      } else {
        setError(result.error || 'Error al agregar la tarjeta');
      }
    } catch (error) {
      console.error('Error al agregar tarjeta:', error);
      setError(error.message || 'Ha ocurrido un error al agregar la tarjeta');
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {!isAllowed ? (
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-red-600 mb-4">
              No tienes permiso para acceder a esta funcionalidad.
            </p>
            <p className="mb-4">
              El manejo de tarjetas solo está disponible para usuarios con correo @unisabana.edu.co
            </p>
            <button
              onClick={() => navigate('/map')}
              className="bg-[#3822B4] text-white py-2 px-4 rounded-lg"
            >
              Volver al mapa
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddCard} className="bg-white rounded-lg shadow-md p-4 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Número de la tarjeta</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <img src={cardIcon} alt="Tarjeta" className="w-6 h-6 mr-2" />
                <input
                  type="text"
                  name="number"
                  value={formData.number}
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
                  value={formData.expiry}
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
                  value={formData.cvv}
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
                value={formData.holder}
                placeholder="Nombre del titular"
                className="w-full border rounded-lg px-3 py-2 outline-none text-gray-700"
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-1">Tipo de tarjeta</label>
              <select
                name="type"
                value={formData.type}
                className="w-full border rounded-lg px-3 py-2 outline-none text-gray-700"
                onChange={handleInputChange}
                required
              >
                <option value="crédito">Tarjeta de Crédito</option>
                <option value="débito">Tarjeta de Débito</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#0E2F55] text-white py-2 rounded-lg text-lg font-bold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Agregando...' : 'Agregar tarjeta'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}