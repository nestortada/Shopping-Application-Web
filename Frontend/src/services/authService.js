/* src/services/authService.js */
export async function register({ email, password }) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, { // Asegúrate de que haya un solo slash
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Error al registrarte');
  }
  return response.json();
}

