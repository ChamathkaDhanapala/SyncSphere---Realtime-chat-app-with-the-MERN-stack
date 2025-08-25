import { Router } from "express";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

export default router;
