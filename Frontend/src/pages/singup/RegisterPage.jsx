/* src/pages/RegisterPage.jsx */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, checkEmail, updateUserRole } from '../../services/authService';
import InputBox from '../../components/InputBox';
import Button from '../../components/Button';
import SuccessModal from '../../components/SuccessModal';
import { routes } from '../../config/routes';
import emailIcon from '../../assets/correo-electronico.png';
import lockIcon from '../../assets/bloqueo-alternativo.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loginPath = routes.find(r => r.id === 'login')?.path || '/';

  const handleEmailBlur = async () => {
    if (!email) return;
    setChecking(true);
    try {
      const exists = await checkEmail(email);
      setEmailExists(exists);
    } catch (err) {
      setEmailExists(false);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (emailExists) {
      setError('Este correo ya está registrado. Usa otro por favor.');
      return;
    }

    try {
      await register({ email, password });
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Error al registrarte');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate(loginPath);
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
          onChange={e => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
        />
        { checking && <p className="text-gray-500 text-sm">Verificando...</p> }
        { emailExists && !checking && (
          <p className="text-red-500 text-sm">
            Este correo ya está registrado.
          </p>
        )}

        <InputBox
          id="password"
          iconSrc={lockIcon}
          placeholder="Contraseña segura"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <InputBox
          id="confirmPassword"
          iconSrc={lockIcon}
          placeholder="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          color="bg-[#0E2F55] text-white"
          text="Registrarme"
          disabled={emailExists || checking}
        />
      </form>

      <p className="mt-4 text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link to={loginPath} className="text-[#ED5706] underline">
          Iniciar sesión
        </Link>
      </p>

      {showModal && <SuccessModal onClose={handleModalClose} />}
    </main>
  );
}

export function UpdateRolePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Perfil Cliente');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await updateUserRole({ email, role });
      setMessage('Rol actualizado correctamente');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Correo del usuario"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Perfil Cliente">Perfil Cliente</option>
        <option value="Perfil POS">Perfil POS</option>
      </select>
      <button type="submit">Actualizar Rol</button>
      {message && <p>{message}</p>}
    </form>
  );
}
