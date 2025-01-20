import express from 'express';
import { addToCart, deleteCartByIds, getCartDataByUserId, updateCartQuantity, getCartDetailById } from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCartDataByUserId);
router.post('/delete', deleteCartByIds);
router.post('/quantity', updateCartQuantity);
router.get('/detail/:cartId', getCartDetailById);

export default router;
