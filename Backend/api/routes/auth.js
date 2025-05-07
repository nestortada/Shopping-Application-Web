// api/routes/auth.js
import express from 'express';
import { registerUser, checkEmail, loginUser, getUserProfile, updateUserRole, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

export default function authRoutes(db) {
  const router = express.Router();

  // Ruta de registro
  router.post('/register', (req, res, next) => registerUser(req, res, next, db));

  // Ruta para verificar si el email ya está registrado
  router.get('/check-email', (req, res, next) => checkEmail(req, res, next, db));

  // Ruta de inicio de sesión
  router.post('/login', (req, res, next) => loginUser(req, res, next, db));

  // Ruta para recuperar contraseña
  router.post('/forgot-password', (req, res, next) => forgotPassword(req, res, next, db));

  // Ruta para restablecer la contraseña
  router.post('/reset-password', (req, res, next) => resetPassword(req, res, next, db));

  // Ruta protegida para obtener el perfil del usuario
  // Aquí estamos usando el middleware authenticateToken para proteger esta ruta
  router.get('/me', authenticateToken, getUserProfile);

  // Ruta para actualizar el rol del usuario
  // También protegida con authenticateToken
  router.put('/update-role', authenticateToken, (req, res, next) => updateUserRole(req, res, next, db));

  return router;
}
