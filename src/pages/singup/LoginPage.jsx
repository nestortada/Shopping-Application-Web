/* src/pages/LoginPage.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBox from '../../components/InputBox';
import cafeImg from '../../assets/cafe.png';
import emailIcon from '../../assets/correo-electronico.png';
import lockIcon from '../../assets/bloqueo-alternativo.png';
import msIcon from '../../assets/microsoft365.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/map');
  };

  return (
    <main className="flex flex-grow flex-col items-center justify-center min-h-screen p-6 bg-[#FBFBFA]">
      {/* Header: Logo and Title */}
      <header className="flex flex-col items-center mb-8">
        <figure className="flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-[#515AFF] border border-[#F0F0F0] shadow-md rounded-full">
          <img src={cafeImg} alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28" />
          <figcaption className="sr-only">Logo de la aplicación</figcaption>
        </figure>
        <h1 className="font-paprika text-2xl sm:text-3xl md:text-4xl leading-tight text-center text-black mt-4">
          Iniciar sesión
        </h1>
      </header>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs sm:max-w-sm lg:max-w-md flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="sr-only">
            Correo electrónico
          </label>
          <InputBox
            id="email"
            iconSrc={emailIcon}
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Contraseña
          </label>
          <InputBox
            id="password"
            iconSrc={lockIcon}
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#0E2F55] border border-[#E2E8F0] shadow hover:shadow-lg rounded-lg text-white font-paprika text-base sm:text-lg transition"
        >
          Iniciar sesión
        </button>
      </form>

      {/* Alternative Login Methods */}
      <section aria-labelledby="alternative-login" className="mt-8 text-center">
        <h2 id="alternative-login" className="sr-only">
          Otras formas de inicio de sesión
        </h2>
        <button
          onClick={() => {/* TODO: MS auth */}}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition"
          aria-label="Iniciar sesión con Microsoft 365"
        >
          <img src={msIcon} alt="" className="w-6 h-6 mr-2" />
          <span className="font-paprika text-sm sm:text-base text-black">
            Microsoft 365
          </span>
        </button>
      </section>

      {/* Footer Links */}
      <footer className="mt-6 space-y-2 text-center">
        <p>
          <a
            href="#"
            onClick={() => navigate('/forgot')}
            className="font-paprika text-sm sm:text-base text-[#0E2F55] underline"
          >
            ¿Olvidaste la contraseña?
          </a>
        </p>
        <p className="font-paprika text-sm sm:text-base">
          ¿No tienes una cuenta?{' '}
          <a
            href="#"
            onClick={() => navigate('/register')}
            className="text-[#0E2F55] underline"
          >
            Regístrate
          </a>
        </p>
      </footer>
    </main>
  );
}