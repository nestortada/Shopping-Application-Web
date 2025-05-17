import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getFavorites, addToFavorites, removeFromFavorites } from '../controllers/customerController.js';

export default function customerRoutes() {
  const router = express.Router();

  // Favorites endpoints
  router.get('/me/favorites', authenticateToken, getFavorites);
  router.post('/me/favorites', authenticateToken, addToFavorites);
  router.delete('/me/favorites/:productId', authenticateToken, removeFromFavorites);

  return router;
}
