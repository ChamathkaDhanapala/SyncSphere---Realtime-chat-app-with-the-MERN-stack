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
    console.log("=== BACKEND UPDATE PROFILE ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("User ID:", req.user._id);

    const { username, bio } = req.body;
    const updates = {};

    if (username !== undefined && username.trim() !== "") {
      updates.username = username.trim();

      const existingUser = await User.findOne({
        username: username.trim(),
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }


    if (bio !== undefined) {
      updates.bio = bio;
    }

    if (req.file) {
      updates.avatarUrl = `/uploads/${req.file.filename}`;
      console.log("New avatar URL:", updates.avatarUrl);
    }

    console.log("Updates to apply:", updates);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user:", user);

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl ? `${user.avatarUrl}?t=${Date.now()}` : user.avatarUrl,
      online: user.online,
      lastSeen: user.lastSeen
    };
    res.json({
      message: "Profile updated successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("Profile update error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Validation error", errors });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }

    res.status(500).json({ message: "Server error updating profile" });
  }
};