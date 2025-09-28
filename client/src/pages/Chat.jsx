import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";
import { api } from "../lib/api.js";

export default function Chat() {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!peer) return;

    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${peer._id}`);
        setMessages(data || []);
      } catch (error) {
        console.log("No messages found, starting fresh");
        setMessages([]);
      }
    };

    loadMessages();
  }, [peer]);

  // Socket message listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message }) => {
      if (!peer || message.sender === peer._id || message.sender === user._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("message:new", handleNewMessage);
    return () => socket.off("message:new", handleNewMessage);
  }, [socket, peer, user]);

  const selectPeer = (selectedPeer) => {
    setPeer(selectedPeer);
  };

  const sendMessage = async (text) => {
    if (!peer || !text.trim()) return;

    const tempMessage = {
      _id: Date.now().toString(),
      text,
      sender: user._id,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    console.log("Sending message:", {
      tempMessageSender: tempMessage.sender,
      currentUserId: user._id,
      peerId: peer._id,
    });

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const { data } = await api.post("/messages/send", {
        to: peer._id,
        text: text,
      });

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? data : msg))
      );
    } catch (error) {
      console.error("API failed, using socket");

      if (socket) {
        socket.emit("message:send", { to: peer._id, text });
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id ? { ...msg, sent: true } : msg
        )
      );
    }
  };

  const sendFile = async (file) => {
    if (!peer || !file) return;

    console.log("Sending file:", file.name, file.type, file.size);

    const tempMessage = {
      _id: Date.now().toString(),
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        isUploading: true,
      },
      sender: user._id,
      createdAt: new Date().toISOString(),
      isTemp: true,
      isFile: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("to", peer._id);

      const { data } = await api.post("/messages/send-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? data : msg))
      );
    } catch (error) {
      console.error("File upload failed:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? {
                ...msg,
                file: {
                  ...msg.file,
                  uploadFailed: true,
                  error: error.response?.data?.message || "Upload failed",
                },
              }
            : msg
        )
      );

      if (socket) {
        console.log("File sharing via socket not implemented");
      }
    }
  };

  const enhancedMessages = messages.map((msg) => {
    if (msg.isFile && msg.file) {
      return {
        ...msg,
        text: `File: ${msg.file.name}`,
      };
    }
    return msg;
  });

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        backgroundColor: "#0f172a",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "320px",
          backgroundColor: "#1f2937",
          borderRight: "1px solid #374151",
        }}
      >
        <Sidebar onSelect={selectPeer} selectedId={peer?._id} />
      </div>

      {/* Main Chat Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {peer ? (
          <>
            {/* Chat Window (includes header) */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ChatWindow me={user} peer={peer} messages={enhancedMessages} />
            </div>

            {/* Message Input */}
            <div
              style={{
                backgroundColor: "#1f2937",
                borderTop: "1px solid #374151",
              }}
            >
              <MessageInput onSend={sendMessage} onFileSend={sendFile} />
            </div>
          </>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "#3b82f6",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                }}
              >
                <span style={{ fontSize: "40px", color: "white" }}>💬</span>
              </div>
              <div
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: "20px",
                  marginBottom: "8px",
                }}
              >
                Welcome to SyncSphere
              </div>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "14px",
                }}
              >
                Select a contact to start chatting
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
