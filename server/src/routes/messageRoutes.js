import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getMessagesWithUser, sendMessage } from "../controllers/messageController.js";

const router = Router();

router.get("/:userId", protect, getMessagesWithUser);
router.post("/send", protect, sendMessage);

export default router;