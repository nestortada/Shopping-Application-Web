// api/routes/auth.js
import express from 'express';
import { registerUser, checkEmail, loginUser, getUserProfile, updateUserRole, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

export default function authRoutes() {
  const router = express.Router();

  // Ruta de registro
  router.post('/register', registerUser);

  // Ruta para verificar si el email ya está registrado
  router.get('/check-email', checkEmail);

  // Ruta de inicio de sesión
  router.post('/login', loginUser);

  // Ruta para recuperar contraseña
  router.post('/forgot-password', forgotPassword);

  // Ruta para restablecer la contraseña
  router.post('/reset-password', resetPassword);

  // Ruta protegida para obtener el perfil del usuario
  router.get('/me', authenticateToken, getUserProfile);

  // Ruta para actualizar el rol del usuario
  router.put('/update-role', authenticateToken, updateUserRole);

  return router;
}
