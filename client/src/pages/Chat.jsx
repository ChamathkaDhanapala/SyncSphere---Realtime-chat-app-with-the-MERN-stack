import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageReactions from "../components/MessageReactions.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";
import { api } from "../lib/api.js";

export default function Chat() {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

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

    const handleMessageUpdate = ({ message }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? message : msg))
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:update", handleMessageUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:update", handleMessageUpdate);
    };
  }, [socket, peer, user]);

  // Typing indicator listener
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ userId, isTyping }) => {
      console.log("Typing event received:", {
        userId,
        isTyping,
        currentPeer: peer?._id,
      });

      if (peer && userId === peer._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [userId]: isTyping,
        }));

        if (isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) => ({
              ...prev,
              [userId]: false,
            }));
          }, 3000);
        }
      }
    };

    socket.on("user:typing", handleUserTyping);
    return () => socket.off("user:typing", handleUserTyping);
  }, [socket, peer]);

  // Clean up typing indicator when peer changes
  useEffect(() => {
    setTypingUsers({});
  }, [peer]);

  const selectPeer = (selectedPeer) => {
    setPeer(selectedPeer);
  };

  const handleReaction = async (messageId, reaction) => {
    if (!socket) return;

    console.log("Sending reaction:", { messageId, reaction });

    // Optimistic local update
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              reactions: [
                // remove old reaction from same user if exists
                ...(msg.reactions?.filter(
                  (r) => r.user !== user._id && r.user?._id !== user._id
                ) || []),
                { user: user._id, reaction }, // add new reaction
              ],
            }
          : msg
      )
    );

    // Emit to backend so others see it
    socket.emit("message:react", {
      messageId,
      reaction,
    });
  };

  const handleFileSend = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("to", peer._id);

      const res = await api.post("/messages/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add to local messages
      setMessages((prev) => [...prev, res.data]);

      // Notify peer
      socket.emit("message:send", res.data);
    } catch (err) {
      console.error("❌ File upload failed:", err);
    }
  };

  const sendMessage = async (text) => {
    if (!peer || !text.trim()) return;

    const tempMessage = {
      _id: Date.now().toString(),
      text,
      sender: user._id,
      createdAt: new Date().toISOString(),
      isTemp: true,
      reactions: [],
    };

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

    console.log("📤 Sending file:", file.name, file.type, file.size);

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
      text: `Uploading: ${file.name}`,
      reactions: [],
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("to", peer._id);

      console.log("📨 Uploading file to server...");

      const { data } = await api.post("/messages/send-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("✅ File upload successful:", data);

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? data : msg))
      );
    } catch (error) {
      console.error("❌ File upload failed:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? {
                ...msg,
                text: `Failed to upload: ${file.name}`,
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
        console.log("🔄 Trying socket fallback for file sharing...");
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
              <ChatWindow
                me={user}
                peer={peer}
                messages={enhancedMessages}
                onReaction={handleReaction}
                MessageReactions={MessageReactions}
              />
            </div>

            {/* Typing Indicator */}
            {peer && typingUsers[peer._id] && (
              <div
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#1f2937",
                  borderBottom: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#6b7280",
                    fontStyle: "italic",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#6b7280",
                        borderRadius: "50%",
                        animation: "typing 1.4s infinite ease-in-out",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#6b7280",
                        borderRadius: "50%",
                        animation: "typing 1.4s infinite ease-in-out 0.2s",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#6b7280",
                        borderRadius: "50%",
                        animation: "typing 1.4s infinite ease-in-out 0.4s",
                      }}
                    ></div>
                  </div>
                  <span>{peer.username} is typing...</span>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div
              style={{
                backgroundColor: "#1f2937",
                borderTop: "1px solid #374151",
              }}
            >
              <MessageInput
                onSend={sendMessage}
                onFileSend={sendFile}
                socket={socket}
                peer={peer}
              />
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
