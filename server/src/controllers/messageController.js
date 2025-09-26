import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

export const getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Find conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    });

    if (!conversation) {
      return res.json([]);
    }

    // Get messages
    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "username avatarUrl")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { to, text } = req.body;
    const from = req.user._id;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [from, to] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [from, to]
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: from,
      text: text,
      seenBy: [from]
    });

    // Populate sender
    await message.populate('sender', 'username avatarUrl');

    // Update conversation
    conversation.latestMessage = message._id;
    await conversation.save();

    res.status(201).json(message);

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};