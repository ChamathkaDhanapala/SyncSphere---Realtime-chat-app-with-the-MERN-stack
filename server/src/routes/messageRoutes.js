import { Router } from "express";
import { protect,authenticate } from "../middleware/auth.js";
import { getMessagesWithUser, sendMessage } from "../controllers/messageController.js";
import multer from "multer";
import Message from "../models/Message.js";
import Conversation from '../models/Conversation.js';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Create this folder in your project root
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and other common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// File upload endpoint
router.post('/send-file', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!to) {
      return res.status(400).json({ message: 'Recipient is required' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, to] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, to]
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
        size: req.file.size
      },
      seenBy: [req.user.id]
    });

    // Update conversation
    conversation.latestMessage = message._id;
    await conversation.save();

    // Populate the message before sending
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatarUrl')
      .populate('reactions.user', 'username');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});


//  Normal text message routes
router.get("/:userId", protect, getMessagesWithUser);
router.post("/send", protect, sendMessage);

export default router;
