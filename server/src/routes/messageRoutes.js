import { Router } from "express";

const router = Router();
router.get("/:userId", protect, getMessagesWithUser);

export default router;
