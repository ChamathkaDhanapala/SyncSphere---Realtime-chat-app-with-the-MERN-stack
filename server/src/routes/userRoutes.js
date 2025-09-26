import { Router } from "express";
import multer from "multer";
import path from "path";
import { listUsers, updateProfile } from "../controllers/userController.js"; // Remove debugUser
import { protect } from "../middleware/auth.js";
import fs from "fs";

const uploadsPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 Saving file to:", uploadsPath);
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log("📄 Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Multer error handling
const handleMulterError = (error, req, res, next) => {
  if (error) {
    console.error("Multer error:", error);
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large (max 5MB)" });
      }
      return res.status(400).json({ error: `Upload error: ${error.code}` });
    }
    return res.status(400).json({ error: error.message });
  }
  next();
};

const router = Router();

router.get("/", protect, listUsers);
router.put("/me", protect, upload.single("avatar"), handleMulterError, updateProfile);

router.get("/debug", protect, (req, res) => {
  res.json({
    user: req.user,
    message: "User debug info"
  });
});


router.get("/check-path", protect, (req, res) => {
  res.json({
    uploadsPath: uploadsPath,
    exists: fs.existsSync(uploadsPath),
    writable: (() => {
      try {
        fs.accessSync(uploadsPath, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    })()
  });
});

export default router;