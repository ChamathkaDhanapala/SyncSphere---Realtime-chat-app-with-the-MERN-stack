import express from 'express';
import { getAllUsers, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js'; 
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/users', protect, adminAuth, getAllUsers);
router.put('/users/:id', protect, adminAuth, updateUser);
router.delete('/users/:id', protect, adminAuth, deleteUser);

export default router;