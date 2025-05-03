// api/routes/auth.js
import express from 'express';
import { registerUser, checkEmail } from '../controllers/authController.js';

export default function authRoutes(db) {
  const router = express.Router();

  router.post('/register', (req, res, next) =>
    registerUser(req, res, next, db)
  );

  // Nuevo endpoint: GET /api/v1/auth/check-email?email=...
  router.get('/check-email', (req, res, next) =>
    checkEmail(req, res, next, db)
  );

  return router;
}
