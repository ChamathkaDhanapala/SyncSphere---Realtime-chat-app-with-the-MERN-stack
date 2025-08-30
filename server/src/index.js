import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);

const io = new SocketIOServer(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", methods: ["GET","POST","PUT","DELETE"], credentials: true }
});

app.get("/", (req, res) => res.send("Chat server is running."));

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatdb";
connectDB(URI).then(() => {
  server.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
});
