// src/services/apiAuthService.js
const API_URL = import.meta.env.VITE_API_URL;

export async function registerApi({ email, password }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/register`, {
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
