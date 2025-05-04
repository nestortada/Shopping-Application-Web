import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Token inválido o faltante');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }

      setMessage('Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#FBFBFA]">
      <h1 className="font-paprika text-2xl sm:text-3xl md:text-4xl mb-6">Restablecer contraseña</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <label htmlFor="newPassword" className="sr-only">Nueva contraseña</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="sr-only">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-[#0E2F55] text-white py-2 px-4 rounded hover:bg-[#0C2545]"
        >
          Restablecer contraseña
        </button>
      </form>
    </main>
  );
}