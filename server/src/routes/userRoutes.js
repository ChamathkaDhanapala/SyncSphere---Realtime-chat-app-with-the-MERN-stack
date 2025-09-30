import { Router } from "express";
import multer from "multer";
import path from "path";
import { listUsers, updateProfile } from "../controllers/userController.js"; // Remove debugUser
import { protect } from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js"; 
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

// Add these admin routes to your existing user.js file:

// Admin routes - require both protect and adminAuth
router.put("/:id/status", protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent self-deactivation
    if (id === req.user.id && !isActive) {
      return res.status(400).json({ 
        error: "Cannot deactivate your own account" 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user 
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

router.put("/:id/role", protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    // Prevent self-demotion
    if (id === req.user.id && !isAdmin) {
      return res.status(400).json({ 
        error: "Cannot remove your own admin privileges" 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      message: `Admin privileges ${isAdmin ? "granted" : "revoked"} successfully`,
      user 
    });
  } catch (error) {
    console.error("Toggle role error:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

router.delete("/:id", protect, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(400).json({ 
        error: "Cannot delete your own account" 
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;