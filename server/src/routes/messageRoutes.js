import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getMessagesWithUser } from "../controllers/messageController.js";

const router = Router();
router.get("/:userId", protect, getMessagesWithUser);

export default router;
