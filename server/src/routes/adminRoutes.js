import { Router } from "express";
import { protect, adminAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

// Apply both middlewares to all admin routes
router.use(protect);
router.use(adminAuth);

router.get("/debug", (req, res) => {
  console.log("🔧 Admin routes debug - User:", req.user?.username);
  res.json({ 
    message: "Admin router is working!",
    user: req.user?.username,
    isAdmin: req.user?.isAdmin
  });
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    console.log("📊 Admin fetching users...");
    const users = await User.find().select("-password");
    console.log(`📊 Found ${users.length} users`);
    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user status
router.put("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    console.log(`🔄 Admin updating user ${id} status to ${isActive}`);

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

// Update user role
router.put("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    console.log(`🔄 Admin updating user ${id} role to ${isAdmin}`);

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

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin deleting user ${id}`);

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