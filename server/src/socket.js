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
      let convo = await Conversation.findOne({
        participants: { $all: [userId, to] },
      });
      if (!convo) {
        convo = await Conversation.create({ participants: [userId, to] });
      }

      const msg = await Message.create({
        conversation: convo._id,
        sender: userId,
        text,
        seenBy: [userId],
        reactions: [],
      });

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

    // Add reaction handler
    socket.on("message:react", async ({ messageId, reaction }) => {
      console.log("🔵 BACKEND: Received reaction:", {
        messageId,
        reaction,
        userId: socket.userId,
      });

      try {
        const message = await Message.findById(messageId).populate(
          "reactions.user"
        );
        if (!message) {
          console.log("❌ Message not found:", messageId);
          return;
        }

        console.log(
          "📝 Found message:",
          message._id,
          "Current reactions:",
          message.reactions
        );

        // Find if user already reacted
        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.user._id.toString() === socket.userId
        );

        if (existingReactionIndex > -1) {
          message.reactions[existingReactionIndex].reaction = reaction;
          console.log("🔄 Updated existing reaction");
        } else {
          message.reactions.push({
            user: socket.userId,
            reaction: reaction,
          });
          console.log("✅ Added new reaction");
        }

        await message.save();

        // Populate the updated message
        const updatedMessage = await Message.findById(messageId).populate(
          "reactions.user"
        );
        console.log(
          "💾 Saved message. Updated reactions:",
          updatedMessage.reactions
        );

        // Broadcast updated message to all participants in the conversation
        const convo = await Conversation.findById(
          message.conversation
        ).populate("participants");
        console.log(
          "📢 Broadcasting to conversation participants:",
          convo.participants.map((p) => p._id)
        );

        if (convo) {
          convo.participants.forEach((participant) => {
            const participantSocket = onlineUsers.get(
              participant._id.toString()
            );
            console.log(
              `🎯 Participant ${participant._id} - socket: ${participantSocket}`
            );
            if (participantSocket) {
              io.to(participantSocket).emit("message:update", {
                message: updatedMessage,
              });
              console.log("📤 Sent message:update to", participant._id);
            }
          });

          // Also send to the user who reacted
          const reactorSocket = onlineUsers.get(socket.userId);
          if (reactorSocket) {
            io.to(reactorSocket).emit("message:update", {
              message: updatedMessage,
            });
            console.log("📤 Sent message:update to reactor", socket.userId);
          }
        }
      } catch (error) {
        console.error("❌ Reaction error:", error);
      }
    });
    // Add typing indicator handler
    socket.on("user:typing", (data) => {
      const { to, isTyping } = data;

      if (!to) return;

      // Broadcast typing event to the recipient
      const recipientSocket = onlineUsers.get(to.toString());
      if (recipientSocket) {
        io.to(recipientSocket).emit("user:typing", {
          userId: socket.userId,
          isTyping: isTyping,
        });
      }
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, {
        online: false,
        lastSeen: new Date(),
      });
      io.emit("presence:update", {
        userId,
        online: false,
        lastSeen: new Date().toISOString(),
      });
    });
  });
}
