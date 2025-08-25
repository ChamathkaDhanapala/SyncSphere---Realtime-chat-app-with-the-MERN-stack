import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id, process.env.JWT_SECRET);
    res.status(201).json({ user: user.toJSON(), token });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(user._id, process.env.JWT_SECRET);
    res.json({ user: user.toJSON(), token });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toJSON() });
}
