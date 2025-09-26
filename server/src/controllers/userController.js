import User from "../models/User.js";

export const listUsers = async (req, res) => {
  try {
    console.log("📋 Fetching users list...");
    
    // Exclude the current user from the list
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("username avatarUrl bio isOnline lastSeen email")
      .sort({ username: 1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("=== PROFILE UPDATE REQUEST ===");
    console.log("📝 User ID:", req.user.id);
    console.log("📋 Request body:", req.body);
    console.log("📁 Uploaded file:", req.file);

    const { username, bio } = req.body;
    const userId = req.user.id;

    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }

    const updateData = {
      username: username.trim(),
      bio: bio ? bio.trim() : "",
    };

    if (req.file) {
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
      console.log("🖼️ Avatar set:", updateData.avatarUrl);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: updatedUser,
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.error("❌ updateProfile error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// Add the missing debugUser function
export const debugUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      user: user,
      message: "Debug user info"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};