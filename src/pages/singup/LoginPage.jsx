// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMsal,
  UnauthenticatedTemplate
} from '@azure/msal-react';
import { loginRequest } from '../../auth/auth-config';
import InputBox from '../../components/InputBox';
import Button from '../../components/Button';
import cafeImg from '../../assets/cafe.png';
import emailIcon from '../../assets/correo-electronico.png';
import lockIcon from '../../assets/bloqueo-alternativo.png';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { instance } = useMsal();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí implementa tu lógica de validación si la necesitas
    navigate('/map');
  };

  const handleMsLogin = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: 'create',
      })
      .catch((error) => console.error(error));
  };

  return (
    <main className="flex flex-grow flex-col items-center justify-center min-h-screen p-6 bg-[#FBFBFA]">
      {/* Header */}
      <header className="flex flex-col items-center mb-8">
        <figure className="flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-[#515AFF] border border-[#F0F0F0] shadow-md rounded-full">
          <img
            src={cafeImg}
            alt="Logo de la aplicación"
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
          />
        </figure>
        <h1 className="font-paprika text-2xl sm:text-3xl md:text-4xl leading-tight text-center text-black mt-4">
          Iniciar sesión
        </h1>
      </header>

      {/* Formulario Email/Password */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs sm:max-w-sm lg:max-w-md flex flex-col gap-4"
      >
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

        <Button
          color="bg-[#0E2F55] text-white"
          text="Iniciar sesión"
          onClick={handleSubmit}
        />
      </form>

      {/* Login con Microsoft */}
      <section className="mt-8 text-center">
        <UnauthenticatedTemplate>
          <Button
            color="bg-white text-black border-gray-300"
            text="Microsoft 365"
            onClick={handleMsLogin}
          />
        </UnauthenticatedTemplate>
      </section>

      {/* Footer */}
      <footer className="mt-6 space-y-2 text-center">
        <Link
          to="/forgot"
          className="font-paprika text-sm sm:text-base text-[#0E2F55] underline cursor-pointer"
        >
          ¿Olvidaste la contraseña?
        </Link>
        <p className="font-paprika text-sm sm:text-base">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="text-[#0E2F55] underline cursor-pointer"
          >
            Regístrate
          </Link>
        </p>
      </footer>
    </main>
);
}
