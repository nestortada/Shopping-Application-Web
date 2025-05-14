<<<<<<< HEAD
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getCards, addCard, deleteCard } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/cards', authenticateToken, getCards);
router.post('/cards', authenticateToken, addCard);
router.delete('/cards/:cardId', authenticateToken, deleteCard);

=======
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getCards, addCard, deleteCard } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/cards', authenticateToken, getCards);
router.post('/cards', authenticateToken, addCard);
router.delete('/cards/:cardId', authenticateToken, deleteCard);

>>>>>>> c6cd8408e916d3b9e06962cd004552a3bafe1093
export default router;