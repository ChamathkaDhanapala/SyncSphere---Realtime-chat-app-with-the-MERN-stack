import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";


export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ message: "Server error during registration" });
  }
}

export async function login(req, res) {
  try {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Request body:", req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("Missing fields - email:", email, "password:", !!password);
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    console.log("Looking for user with email:", email);
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      console.log("❌ No user found with email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    console.log("✅ User found:", user.email);
    console.log("Stored password hash:", user.password);
    
    const isPasswordValid = await user.matchPassword(password);
    console.log("Password validation result:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("❌ Password validation failed");
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    console.log("✅ Login successful for user:", user.email);
    
    const token = generateToken(user._id);
    
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    
    res.json({ user: userWithoutPassword, token });
    
  } catch (e) {
    console.error("🔥 Login error details:", e);
    res.status(500).json({ message: "Server error during login" });
  }
}

export async function me(req, res) {
  try {
    const userWithoutPassword = req.user.toJSON();
    delete userWithoutPassword.password;
    res.json({ user: userWithoutPassword });
  } catch (e) {
    console.error("Me endpoint error:", e);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getUsers(req, res) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password");
    
    res.json(users);
  } catch (e) {
    console.error("Get users error:", e);
    res.status(500).json({ message: "Server error fetching users" });
  }
}