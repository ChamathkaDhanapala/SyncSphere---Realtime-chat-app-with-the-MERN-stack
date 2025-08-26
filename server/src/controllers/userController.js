import User from "../models/User.js";

export async function listUsers(req, res) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password").sort({ online: -1, username: 1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { username, bio } = req.body;
    if (username !== undefined) req.user.username = username;
    if (bio !== undefined) req.user.bio = bio;
    if (req.file) {
      // simple local storage path
      req.user.avatarUrl = `/uploads/${req.file.filename}`;
    }
    await req.user.save();
    res.json(req.user.toJSON());
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}
