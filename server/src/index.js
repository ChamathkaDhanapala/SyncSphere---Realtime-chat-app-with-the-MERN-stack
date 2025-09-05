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

dotenv.config();

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


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads")); 


app.use("/api", authRoutes);
app.use("/api/users", userRoutes);        
app.use("/api/messages", messageRoutes);  


setupSocket(io);

connectDB(process.env.MONGO_URI);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});