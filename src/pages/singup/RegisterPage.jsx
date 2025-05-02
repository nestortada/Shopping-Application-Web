/* src/pages/RegisterPage.jsx */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputBox from '../../components/InputBox';
import Button from '../../components/Button';
import emailIcon from '../../assets/correo-electronico.png';
import lockIcon from '../../assets/bloqueo-alternativo.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#FBFBFA]">
      <h1 className="font-paprika text-3xl mb-6">Crea tu cuenta</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <InputBox
          id="email"
          iconSrc={emailIcon}
          placeholder="Correo institucional"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputBox
          id="password"
          iconSrc={lockIcon}
          placeholder="Contraseña segura"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" color="bg-[#0E2F55] text-white" text="Registrarme" />
      </form>

      <p className="mt-4 text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/" className="text-[#ED5706] underline">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}

