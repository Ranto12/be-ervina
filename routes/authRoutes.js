import express from 'express';
import { userLogin, adminLogin, userRegister, adminRegister, getUserById, getUsersByRole } from '../controllers/authController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes untuk login dan register User
router.post('/login', userLogin);
router.post('/register', userRegister);

// Routes untuk login dan register Admin
router.post('/login/admin', adminLogin);
router.post('/register/admin', adminRegister);

// Routes untuk mendapatkan semua pengguna berdasarkan role
router.get('/users', getUsersByRole);

// Routes untuk mendapatkan pengguna berdasarkan ID
router.get('/users/:id', getUserById);

export default router;
