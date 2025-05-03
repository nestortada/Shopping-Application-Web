/* src/services/authService.js */
export async function register({ email, password }) {
    const response = await fetch('/api/v1/auth/register', {
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

