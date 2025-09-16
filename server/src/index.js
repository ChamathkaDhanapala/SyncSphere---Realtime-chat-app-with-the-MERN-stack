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
import adminRoutes from "./routes/admin.js"; 
import { connectDB } from "./config/db.js";
import { setupSocket } from "./socket.js";
import path from "path"; 
import { fileURLToPath } from "url"; 
import { protect } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || "http://localhost:3000");
  res.header('Access-Control-Allow-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, "uploads"))); 

app.get("/api/test", (req, res) => {
  console.log("✅ Test route hit!");
  res.json({ message: "Server is working!", timestamp: new Date() });
});

app.post("/api/test-post", (req, res) => {
  console.log("✅ Test POST route hit!", req.body);
  res.json({ message: "POST is working!", data: req.body });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", protect, userRoutes);       
app.use("/api/messages", protect, messageRoutes); 
app.use('/api/admin', protect, adminRoutes); 

setupSocket(io);

connectDB(process.env.MONGO_URI);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});