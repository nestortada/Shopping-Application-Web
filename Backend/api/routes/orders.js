import express from 'express';
import { validateOrder } from '../controllers/orderController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

export default function orderRoutes() {
  const router = express.Router();

  // Ruta para validar disponibilidad de productos en un pedido
  router.post('/validate', authenticateToken, validateOrder);

  return router;
}
