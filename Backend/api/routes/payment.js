import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getCards, addCard, deleteCard } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/cards', authenticateToken, getCards);
router.post('/cards', authenticateToken, addCard);
router.delete('/cards/:cardId', authenticateToken, deleteCard);

export default router;