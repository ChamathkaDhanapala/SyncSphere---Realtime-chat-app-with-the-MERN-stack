import User from "../models/User.js";

export const listUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required." 
      });
    }

    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required." 
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;

  
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
};

// Toggle user admin role
export const toggleUserRole = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required." 
      });
    }

    const { id } = req.params;
    const { isAdmin } = req.body;

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
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required." 
      });
    }

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
};