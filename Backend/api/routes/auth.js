// api/routes/auth.js
import express from 'express';
import { registerUser, checkEmail, loginUser, getUserProfile, updateUserRole } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

export default function authRoutes(db) {
  const router = express.Router();

  router.post('/register', (req, res, next) =>
    registerUser(req, res, next, db)
  );

  router.get('/check-email', (req, res, next) =>
    checkEmail(req, res, next, db)
  );

  router.post('/login', (req, res, next) =>
    loginUser(req, res, next, db)
  );

  router.get('/me', authenticateToken, getUserProfile);

  router.put('/update-role', authenticateToken, async (req, res, next) =>
    updateUserRole(req, res, next, db)
  );

  return router;
}
