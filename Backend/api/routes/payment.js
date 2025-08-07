import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  getCards,
  addCard,
  deleteCard,
  createCheckoutSession,
  getSessionStatus
} from '../controllers/paymentController.js';

export default function paymentRoutes() {
  const router = express.Router();

  router.get('/cards', authenticateToken, getCards);
  router.post('/cards', authenticateToken, addCard);
  router.delete('/cards/:cardId', authenticateToken, deleteCard);

  router.post('/create-checkout-session', createCheckoutSession);
  router.get('/session/:id', getSessionStatus);

  return router;
}