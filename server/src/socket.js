import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

const onlineUsers = new Map();

export function setupSocket(io) {
  global.io = io;
  global.onlineUsers = onlineUsers;

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

    console.log(`🟢 User ${userId} connected. Socket: ${socket.id}`);
    console.log("📊 Online users:", Array.from(onlineUsers.entries()));

    // --- Send Message ---
    socket.on("message:send", async ({ to, text, file, isFile }) => {
      console.log(
        "🔵 BACKEND: Message received from:",
        socket.userId,
        "to:",
        to,
        "isFile:",
        isFile
      );

      if (!to || (!text && !file)) return;

      try {
        let convo = await Conversation.findOne({
          participants: { $all: [socket.userId, to] },
        });
        if (!convo) {
          convo = await Conversation.create({
            participants: [socket.userId, to],
          });
        }

        const msgData = {
          conversation: convo._id,
          sender: socket.userId,
          seenBy: [socket.userId],
          reactions: [],
        };

        if (isFile && file) {
          msgData.text = text || `File: ${file.originalName}`;
          msgData.file = file;
          msgData.isFile = true;
        } else {
          msgData.text = text;
        }

        const msg = await Message.create(msgData);

        convo.latestMessage = msg._id;
        await convo.save();

        // Populate sender info
        const populatedMessage = await Message.findById(msg._id).populate(
          "sender",
          "username avatarUrl"
        );

        console.log(
          "📨 BACKEND: Message created:",
          populatedMessage._id,
          "File:",
          isFile
        );

        // Emit to sender
        io.to(socket.id).emit("message:new", { message: populatedMessage });
        console.log("📤 BACKEND: Message sent to sender:", socket.userId);

        // Emit to receiver
        const receiverId = to.toString();
        const toSocket = onlineUsers.get(receiverId);

        if (toSocket) {
          io.to(toSocket).emit("message:new", { message: populatedMessage });
          console.log("📤 BACKEND: Message sent to receiver:", receiverId);

          // Send notification
          io.to(toSocket).emit("message:notification", {
            message: populatedMessage,
            type: "new_message",
          });
          console.log("📢 BACKEND: Notification sent to:", receiverId);
        } else {
          console.log("❌ BACKEND: Receiver not online");
        }
      } catch (error) {
        console.error("❌ Message send error:", error);
      }
    });

    // --- React to Message ---
    socket.on("message:react", async ({ messageId, reaction }) => {
      try {
        const message = await Message.findById(messageId).populate(
          "reactions.user"
        );
        if (!message) {
          console.log("❌ Message not found for reaction:", messageId);
          return;
        }

        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.user._id.toString() === socket.userId
        );

        if (existingReactionIndex > -1) {
          message.reactions[existingReactionIndex].reaction = reaction;
        } else {
          message.reactions.push({
            user: socket.userId,
            reaction,
          });
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
          .populate("reactions.user", "username")
          .populate("sender", "username avatarUrl");

        // Broadcast to all conversation participants
        const convo = await Conversation.findById(
          message.conversation
        ).populate("participants");
        if (convo) {
          convo.participants.forEach((participant) => {
            const participantSocket = onlineUsers.get(
              participant._id.toString()
            );
            if (participantSocket) {
              io.to(participantSocket).emit("message:update", {
                message: updatedMessage,
              });
            }
          });
        }

        console.log("✅ Reaction updated for message:", messageId);
      } catch (error) {
        console.error("❌ Reaction error:", error);
      }
    });

    // --- Pin/Unpin Message ---
    socket.on("message:pin", async ({ messageId, isPinned }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          console.log("❌ Message not found for pin:", messageId);
          return;
        }

        message.isPinned = isPinned;
        if (isPinned) {
          message.pinnedBy = socket.userId;
          message.pinnedAt = new Date();
        } else {
          message.pinnedBy = undefined;
          message.pinnedAt = undefined;
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
          .populate("sender", "username avatarUrl")
          .populate("reactions.user", "username");

        // Broadcast to all conversation participants
        const convo = await Conversation.findById(
          message.conversation
        ).populate("participants");
        if (convo) {
          convo.participants.forEach((participant) => {
            const participantSocket = onlineUsers.get(
              participant._id.toString()
            );
            if (participantSocket) {
              io.to(participantSocket).emit("message:pin", {
                message: updatedMessage,
              });
            }
          });
        }

        console.log("✅ Message pinned status updated:", messageId, isPinned);
      } catch (error) {
        console.error("❌ Pin message error:", error);
      }
    });

    // --- Delete Message ---
    socket.on("message:delete", async ({ messageId, deleteForEveryone }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          console.log("❌ Message not found for delete:", messageId);
          return;
        }

        if (deleteForEveryone) {
          // Delete for everyone (only sender can do this within 1 hour)
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (
            message.createdAt < oneHourAgo &&
            message.sender.toString() !== socket.userId
          ) {
            console.log("❌ Cannot delete old message for everyone");
            return;
          }

          message.isDeleted = true;
          message.deletedBy = [socket.userId];
          message.deletedAt = new Date();
        } else {
          // Delete for me only
          if (!message.deletedBy) {
            message.deletedBy = [socket.userId];
          } else if (!message.deletedBy.includes(socket.userId)) {
            message.deletedBy.push(socket.userId);
          }
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
          .populate("sender", "username avatarUrl")
          .populate("reactions.user", "username");

        // Broadcast to all conversation participants
        const convo = await Conversation.findById(
          message.conversation
        ).populate("participants");
        if (convo) {
          convo.participants.forEach((participant) => {
            const participantSocket = onlineUsers.get(
              participant._id.toString()
            );
            if (participantSocket) {
              io.to(participantSocket).emit("message:update", {
                message: updatedMessage,
              });
            }
          });
        }

        console.log(
          "✅ Message deleted:",
          messageId,
          deleteForEveryone ? "for everyone" : "for me"
        );
      } catch (error) {
        console.error("❌ Delete message error:", error);
      }
    });

    // --- Forward Message ---
    socket.on("message:forward", async ({ messageIds, toUsers }) => {
      try {
        if (!messageIds || !toUsers || !Array.isArray(toUsers)) {
          console.log("❌ Invalid forward data");
          return;
        }

        for (const toUserId of toUsers) {
          let conversation = await Conversation.findOne({
            participants: { $all: [socket.userId, toUserId] },
          });

          if (!conversation) {
            conversation = await Conversation.create({
              participants: [socket.userId, toUserId],
            });
          }

          // Forward each message
          for (const messageId of messageIds) {
            const originalMessage = await Message.findById(messageId).populate(
              "sender",
              "username avatarUrl"
            );

            if (!originalMessage || originalMessage.isDeleted) {
              continue;
            }

            const forwardedMessage = await Message.create({
              conversation: conversation._id,
              sender: socket.userId,
              text: originalMessage.text,
              isFile: originalMessage.isFile,
              file: originalMessage.file,
              isForwarded: true,
              forwardedFrom: messageId,
              seenBy: [socket.userId],
            });

            // Update conversation
            conversation.latestMessage = forwardedMessage._id;
            await conversation.save();

            const populatedMessage = await Message.findById(
              forwardedMessage._id
            )
              .populate("sender", "username avatarUrl")
              .populate("forwardedFrom", "sender text");

            // Notify recipient
            const recipientSocket = onlineUsers.get(toUserId);
            if (recipientSocket) {
              io.to(recipientSocket).emit("message:new", {
                message: populatedMessage,
              });
            }

            // Notify sender
            io.to(socket.id).emit("message:new", { message: populatedMessage });
          }
        }

        console.log("✅ Messages forwarded successfully");
      } catch (error) {
        console.error("❌ Forward message error:", error);
      }
    });

    // --- Typing Indicator ---
    socket.on("user:typing", ({ to, isTyping }) => {
      if (!to) return;
      const recipientSocket = onlineUsers.get(to.toString());
      if (recipientSocket) {
        io.to(recipientSocket).emit("user:typing", {
          userId: socket.userId,
          isTyping,
        });
      }
    });

    // --- Disconnect ---
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
      console.log(`🔴 User ${userId} disconnected`);
    });
  });
}
