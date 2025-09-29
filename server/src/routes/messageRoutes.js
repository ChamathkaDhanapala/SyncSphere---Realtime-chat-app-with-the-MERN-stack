import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getMessagesWithUser,
  sendMessage,
} from "../controllers/messageController.js";
import multer from "multer";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Messages route is working!" });
});

// File upload endpoint
router.post("/send-file", protect, upload.single("file"), async (req, res) => {
  try {
    const { to } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!to) {
      return res.status(400).json({ message: "Recipient is required" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, to] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, to],
      });
    }

    // Create message with file
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: `File: ${req.file.originalname}`,
      isFile: true,
      file: {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype,
        size: req.file.size,
      },
      seenBy: [req.user.id],
    });

    conversation.latestMessage = message._id;
    await conversation.save();

    // Populate the message before sending
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username avatarUrl")
      .populate("reactions.user", "username");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
});

// Pin/Unpin message endpoint
router.post("/pin", protect, async (req, res) => {
  try {
    console.log("📌 Pin request received:", req.body);

    const { messageId, isPinned } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.isPinned = isPinned;
    if (isPinned) {
      message.pinnedBy = req.user.id;
      message.pinnedAt = new Date();
    } else {
      message.pinnedBy = undefined;
      message.pinnedAt = undefined;
    }

    await message.save();

    // Populate the updated message
    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "username avatarUrl")
      .populate("reactions.user", "username");

    console.log("✅ Message pinned successfully:", messageId, isPinned);

    res.json(updatedMessage);
  } catch (error) {
    console.error("❌ Pin message error:", error);
    res
      .status(500)
      .json({ message: "Failed to pin message", error: error.message });
  }
});

// Delete message endpoint
router.post("/delete", protect, async (req, res) => {
  try {
    console.log("🗑️ Delete request received:", req.body);

    const { messageId, deleteForEveryone } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (deleteForEveryone) {
      // Delete for everyone (only sender can do this within 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (
        message.createdAt < oneHourAgo &&
        message.sender.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "Can only delete recent messages for everyone" });
      }

      message.isDeleted = true;
      message.deletedBy = [req.user.id];
      message.deletedAt = new Date();
    } else {
      // Delete for me only
      if (!message.deletedBy) {
        message.deletedBy = [req.user.id];
      } else if (!message.deletedBy.includes(req.user.id)) {
        message.deletedBy.push(req.user.id);
      }
    }

    await message.save();

    // Populate the updated message
    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "username avatarUrl")
      .populate("reactions.user", "username");

    console.log("✅ Message deleted successfully:", messageId);

    res.json(updatedMessage);
  } catch (error) {
    console.error("❌ Delete message error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete message", error: error.message });
  }
});

//  Forward message endpoint
router.post("/forward", protect, async (req, res) => {
  try {
    console.log("↩️ Forward request received:", req.body);

    const { messageIds, toUsers } = req.body;

    if (!messageIds || !toUsers || !Array.isArray(toUsers)) {
      return res
        .status(400)
        .json({ message: "Message IDs and recipients are required" });
    }

    const forwardedMessages = [];

    for (const toUserId of toUsers) {
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, toUserId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user.id, toUserId],
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
          sender: req.user.id,
          text: originalMessage.text,
          isFile: originalMessage.isFile,
          file: originalMessage.file,
          isForwarded: true,
          forwardedFrom: messageId,
          seenBy: [req.user.id],
        });

        conversation.latestMessage = forwardedMessage._id;
        await conversation.save();

        const populatedMessage = await Message.findById(forwardedMessage._id)
          .populate("sender", "username avatarUrl")
          .populate("forwardedFrom", "sender text");

        forwardedMessages.push(populatedMessage);
      }
    }

    console.log(
      "✅ Messages forwarded successfully:",
      forwardedMessages.length
    );

    res.json(forwardedMessages);
  } catch (error) {
    console.error("❌ Forward message error:", error);
    res
      .status(500)
      .json({ message: "Failed to forward message", error: error.message });
  }
});

// Normal text message routes
router.get("/:userId", protect, getMessagesWithUser);
router.post("/send", protect, sendMessage);

export default router;
