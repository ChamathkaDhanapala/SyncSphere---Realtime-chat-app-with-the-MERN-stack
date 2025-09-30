import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --- Protect middleware: verify JWT ---
export async function protect(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
}

// --- Admin middleware: check if user is admin ---
export function adminAuth(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
}

// --- Combined protect + admin middleware ---
export function requireAdmin(req, res, next) {
  protect(req, res, (err) => {
    if (err) return next(err);
    adminAuth(req, res, next);
  });
}