import { Router } from "express";
import { login, register, me, getUsers } from "../controllers/authController.js"; 
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", protect, me);
router.get("/users", protect, getUsers);

export default router;
