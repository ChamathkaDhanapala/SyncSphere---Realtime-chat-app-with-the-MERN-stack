import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

export async function getMessagesWithUser(req, res) {
  try {
    const otherId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, otherId] }
    });

   
    if (!convo) {
      return res.json([]); 
    }

    const msgs = await Message.find({ conversation: convo._id })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatarUrl");

    res.json(msgs);
  } catch (e) {
    console.error("Get messages error:", e);
    res.status(500).json({ message: "Server error fetching messages" });
  }
}