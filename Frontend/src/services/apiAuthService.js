// src/services/apiAuthService.js
const API_URL = import.meta.env.VITE_API_URL;

// Función para registrarse
export async function registerApi({ email, password }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || 'Error al registrarte');
  }

  return res.json();
}

// Función para iniciar sesión y obtener el token
export async function loginApi({ email, password }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || 'Error al iniciar sesión');
  }

  return res.json(); // Aquí puedes guardar el token en el localStorage
}

// Función para obtener el perfil del usuario
export async function getUserProfileApi(token) {
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Include credentials for CORS
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Sesión expirada');
      }
      const { message } = await res.json();
      throw new Error(message || 'Error al cargar el perfil');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error en getUserProfileApi:', error);
    throw new Error(error.message || 'Error al cargar el perfil');
  }
}

// Función para cerrar sesión (eliminar token)
export function logout() {
  localStorage.removeItem('token');
}
