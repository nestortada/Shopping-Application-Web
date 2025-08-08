/* src/services/authService.js */
const API_URL = import.meta.env.VITE_API_URL;

export async function register({ email, password }) {
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

export async function login({ email, password }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || 'Error al iniciar sesión');
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function getUserProfile() {
  const token = localStorage.getItem('token');
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
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Sesión expirada');
      }
      const { message } = await res.json();
      throw new Error(message || 'Error al cargar el perfil');
    }

    return res.json();
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    throw new Error(error.message || 'Error al cargar el perfil');
  }
}

export async function updateUserRole({ email, role }) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${API_URL}/auth/update-role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email, role }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Error al actualizar el rol');
  }

  return response.json();
}

export async function checkEmail(email) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`
  );
  const data = await res.json();
  return data.exists;
}

export function logout() {
  localStorage.removeItem('token');
}

