import { getUserProfile } from './authService';

/**
 * Asegura que el usuario tenga el rol correcto según su dominio de email
 * @returns {Promise<string>} - El rol actual del usuario
 */
export async function ensureCorrectRole() {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      throw new Error('No hay usuario autenticado');
    }

    // Obtener el perfil del usuario
    const userProfile = await getUserProfile();
    
    // Determinar el rol esperado basado en el dominio de email
    let expectedRole = '';
    if (userEmail.endsWith('@sabanapos.edu.co')) {
      expectedRole = 'Perfil POS';
    } else if (userEmail.endsWith('@unisabana.edu.co')) {
      expectedRole = 'Perfil Cliente';
    } else {
      throw new Error('Dominio de email no soportado');
    }
    
    // Si el rol no coincide con el esperado, intentar actualizarlo
    if (userProfile.role !== expectedRole) {
      console.warn(`El rol actual del usuario (${userProfile.role}) no coincide con el esperado (${expectedRole}). Intente cerrar sesión y volver a iniciar sesión.`);
    }
    
    return userProfile.role;
  } catch (error) {
    console.error('Error al verificar el rol:', error);
    throw error;
  }
}
