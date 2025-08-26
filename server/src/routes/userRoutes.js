import { Router } from "express";
import multer from "multer";
import path from "path";
import { listUsers, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random()*1e9) + path.extname(file.originalname))
  }),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

const router = Router();
router.get("/", protect, listUsers);
router.put("/me", protect, upload.single("avatar"), updateProfile);

export default router;
