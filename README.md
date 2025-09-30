# 💬 SyncSphere-Realtime-chat-app-with-the-MERN-stack
SyncSphere is a real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js with and Socket.io. It provides a complete messaging solution with advanced features for both users and administrators.

---

## ✨ Features  

### 💬 Chat Features  
- Real-time Messaging: Instant message delivery using Socket.io 
- File Sharing: Upload and share images, PDFs, and documents (10MB limit)
- Emoji Support: Full emoji picker for expressive messaging
- Message Reactions: React to messages with emojis (like WhatsApp)  
- Message Forwarding: Forward messages to multiple contacts
- Message Pinning: Pin important messages for quick access
- Message Deletion: Delete messages for yourself or everyone (within 1 hour) 
- Search Messages: Advanced search within conversations
- Typing Indicators: See when someone is typing
- Online Presence: Real-time online/offline status

### 👥 User Management  
- User Registration & Authentication: Secure JWT-based auth 
- Profile Management: Edit profile information and avatar  
- User Search: Find and connect with other users
- Online Status: See who's online in real-time

### 🛠️ Administrative Features
- Admin Dashboard: Comprehensive admin interface
- User Management: View all users and their status
- Admin Controls: Grant/revoke admin privileges
- User Deactivation: Temporarily deactivate users without deletion
- User Deletion: Permanently remove users from the system 

### 🔔 Notifications  
- Browser Notifications: Desktop notifications for new messages
- Message Read Receipts: See when messages are delivered  

---

## 🛠️ Tech Stack  

### Frontend
- React - UI framework with hooks
- Socket.io-client - Real-time communication
- Axios - HTTP client for API calls
- Context API - State management
- Emoji Picker React - Emoji selection component
- CSS-in-JS - Component styling

### Backend
- Node.js - Runtime environment
- Express.js - Web framework
- Socket.io - Real-time bidirectional communication
- MongoDB - NoSQL database
- Mongoose - ODM for MongoDB
- JWT - Authentication tokens
- bcryptjs - Password hashing
- Multer - File upload handling
- CORS - Cross-origin resource sharing

---

## 📂 Project Structure  

```plaintext
syncsphere/
├── client/        # React frontend
│   ├── src/
│   │   ├── components/   # UI components (ChatWindow, Sidebar, MessageInput, etc.)
│   │   ├── context/      # Auth & Socket Provider context
│   │   ├── pages/        # Login, Register, Chat
│   │   └── lib/          # API helpers
│   │   └── App.jsx/
│   │   └── App.jsx/
│   |── .env/
│   |── package.json /
|
├── server/        # Node.js backend
│   ├── src/
│   |   ├── config/        # (db.js)
│   |   ├── models/        # MongoDB schemas (User, Message, Conversation)
│   |   ├── routes/        # Express routes (auth, messages, users, admin)
│   |   ├── controllers/   # Business logic
│   |   ├── middleware/    # Auth & role check
│   |   ├── utils/         # Token Generate
│   |   |── socket.js/     # Socket.IO handlers
│   |   |── index.js/      # Socket.IO handlers
│   |   |── uploads/       # Upload directory
│   |── .env/
│   |── package.json /
│
└── README.md
```

## 🛠️ Installation  

Clone the repository and move into the project folder:  

```bash
git clone https://github.com/chamathka/syncsphere.git
cd mern-chat-app
```

Install dependencies for both client and server:  

```bash
cd client
npm install

cd ../server
npm install
```

## 🎥 Demo
https://github.com/user-attachments/assets/82e60ea2-15bc-4f7a-917b-9c92c4b0d27a



