import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../services/authService';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error(err.message);
      }
    }
    fetchUser();
  }, []);

  if (!user) return <p>Cargando...</p>;

  return (
    <div>
      <h1>
        {user.role === 'Perfil POS' ? 'Hola POS' : 'Hola Cliente'}
      </h1>
      <p>Correo: {user.email}</p>
      <p>Rol: {user.role}</p>
    </div>
  );
}