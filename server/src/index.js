import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { connectDB } from "./config/db.js";
import { setupSocket } from "./socket.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // unified
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

const uploadsPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsPath);
}

app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader(
        "Access-Control-Allow-Origin",
        process.env.FRONTEND_URL || "http://localhost:3000"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Setup socket.io
setupSocket(io);

// MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}
connectDB(process.env.MONGO_URI);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsPath}`);
  console.log(`🌐 Uploads available at: http://localhost:${PORT}/uploads/`);
});
