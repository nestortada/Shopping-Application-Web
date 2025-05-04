/* src/services/authService.js */
export async function register({ email, password, role }) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Error al registrarte');
  }

  return response.json();
}

export async function login({ email, password }) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Error al iniciar sesión');
  }

  return response.json();
}

export async function getUserProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/me`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el perfil del usuario');
  }

  return response.json();
}

export async function updateUserRole({ email, role }) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/update-role`, {
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

