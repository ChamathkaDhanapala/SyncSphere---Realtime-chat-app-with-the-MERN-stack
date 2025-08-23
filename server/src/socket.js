import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

// In-memory online users map: userId -> socket.id
const onlineUsers = new Map();

export function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (e) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("presence:update", { userId, online: true });

    socket.on("message:send", async ({ to, text }) => {
      if (!to || !text) return;
      // Find or create conversation between {userId, to}
      let convo = await Conversation.findOne({ participants: { $all: [userId, to] } });
      if (!convo) {
        convo = await Conversation.create({ participants: [userId, to] });
      }
      const msg = await Message.create({ conversation: convo._id, sender: userId, text, seenBy: [userId] });
      convo.latestMessage = msg._id;
      await convo.save();

      // Emit to sender
      io.to(socket.id).emit("message:new", { message: msg });

      // Emit to receiver if online
      const toSocket = onlineUsers.get(to.toString());
      if (toSocket) {
        io.to(toSocket).emit("message:new", { message: msg });
      }
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
      io.emit("presence:update", { userId, online: false, lastSeen: new Date().toISOString() });
    });
  });
}
