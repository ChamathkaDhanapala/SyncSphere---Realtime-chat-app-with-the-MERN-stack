import User from "../models/User.js";
import path from "path";
import fs from "fs";

export async function listUsers(req, res) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password").sort({ online: -1, username: 1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;

    if (req.file) {
      if (req.user.avatarUrl) {
        const oldAvatarPath = path.join("uploads", path.basename(req.user.avatarUrl));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};