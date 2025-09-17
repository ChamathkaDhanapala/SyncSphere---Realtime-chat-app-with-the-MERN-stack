import { Router } from "express";
import { login, register, me, getUsers } from "../controllers/authController.js"; 
import { protect, adminAuth } from '../middleware/auth.js';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, getUsers);

export default router;