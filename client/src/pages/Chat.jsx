import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessageReactions from "../components/MessageReactions.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";
import { api } from "../lib/api.js";

// Notification Toast Component
const NotificationToast = ({
  message,
  avatar,
  onClose,
  onClick,
  type = "info",
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "#10b981"; // Green for success
      case "error":
        return "#ef4444"; // Red for error
      case "info":
        return "#3b82f6"; // Blue for info
      case "sent":
        return "#6b7280"; // Gray for sent confirmation
      default:
        return "#3b82f6";
    }
  };

  return (
    <div
      style={{
        backgroundColor: getBgColor(),
        color: "white",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "300px",
        maxWidth: "400px",
        animation: "slideIn 0.3s ease-out",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {avatar && (
        <img
          src={avatar}
          alt="User"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: "500" }}>
          {type === "sent" ? "Message Sent" : "New Message"}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.9)",
            marginTop: "2px",
          }}
        >
          {message}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          cursor: "pointer",
          fontSize: "16px",
          padding: "4px",
          borderRadius: "4px",
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Browser notification function
  const showBrowserNotification = (title, body, icon) => {
    if (!("Notification" in window)) {
      console.log("❌ Browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: icon || "/favicon.ico",
        tag: "message",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: body,
            icon: icon || "/favicon.ico",
            tag: "message",
          });
        }
      });
    }
  };

  // Custom notification function
  const showNotification = (message, type = "info", avatar = null) => {
    const notificationId = Date.now().toString();
    setNotifications((prev) => [
      ...prev,
      {
        id: notificationId,
        message,
        avatar,
        type,
      },
    ]);
  };

  // Request notification permission when user interacts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const handleInteraction = () => {
        Notification.requestPermission().then((permission) => {
          console.log("🔔 Notification permission:", permission);
        });
        document.removeEventListener("click", handleInteraction);
      };

      document.addEventListener("click", handleInteraction);

      return () => {
        document.removeEventListener("click", handleInteraction);
      };
    }
  }, []);

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

  // Delete message function
  const handleDeleteMessage = async (messageId, deleteForEveryone = false) => {
    if (!socket) return;

    try {
      const { data } = await api.post("/messages/delete", {
        messageId,
        deleteForEveryone,
      });

      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? data : msg))
      );

      showNotification(
        deleteForEveryone
          ? "Message deleted for everyone"
          : "Message deleted for you",
        "success"
      );
    } catch (error) {
      console.error("Delete message failed:", error);
      showNotification("Failed to delete message", "error");
      socket.emit("message:delete", { messageId, deleteForEveryone });
    }
  };

  // Forward message function
  const handleForwardMessage = async (messageIds, toUsers) => {
    if (!socket) return;

    try {
      const { data } = await api.post("/messages/forward", {
        messageIds,
        toUsers,
      });

      showNotification(
        `Message forwarded to ${toUsers.length} contact(s)`,
        "success"
      );
      return data;
    } catch (error) {
      console.error("Forward message failed:", error);
      showNotification("Failed to forward message", "error");
      throw error;
    }
  };

  // Socket message listener
  useEffect(() => {
    if (!socket) {
      console.log("❌ No socket available - check SocketProvider");
      return;
    }

    console.log("🟢 Setting up socket listeners");

    const handleNewMessage = ({ message }) => {
      console.log("🟢 FRONTEND: New message received:", message._id);

      if (!peer || message.sender === peer._id || message.sender === user._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageUpdate = ({ message }) => {
      console.log("🟢 FRONTEND: Message update received:", message._id);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? message : msg))
      );
    };

    const handleMessagePinUpdate = ({ message }) => {
      console.log(
        "🟢 FRONTEND: Message pin update received:",
        message._id,
        message.isPinned
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === message._id ? { ...msg, isPinned: message.isPinned } : msg
        )
      );
    };

    const handleMessageDelete = ({ message }) => {
      console.log("🟢 FRONTEND: Message delete update received:", message._id);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? message : msg))
      );
    };

    // Handle message notifications (for receivers)
    const handleMessageNotification = ({ message, type }) => {
      console.log("🟢 FRONTEND: Notification event received");

      if (type === "new_message") {
        const isFromMe = message.sender._id === user._id;
        const senderName = isFromMe ? "You" : message.sender.username;

        const messageText =
          message.text.length > 50
            ? message.text.substring(0, 50) + "..."
            : message.text;

        const avatarUrl = message.sender.avatarUrl
          ? `http://localhost:5000${message.sender.avatarUrl}`
          : null;

        console.log("📢 FRONTEND: Creating notification");

        const notificationId = Date.now().toString();
        setNotifications((prev) => [
          ...prev,
          {
            id: notificationId,
            message: `${senderName}: ${messageText}`,
            avatar: avatarUrl,
            type: isFromMe ? "sent" : "info",
          },
        ]);

        console.log("✅ FRONTEND: Notification added");

        // Show browser notification if tab is not active and message is from others
        if (document.hidden && !isFromMe) {
          console.log(
            "📢 FRONTEND: Tab is hidden, showing browser notification"
          );
          showBrowserNotification(
            `New message from ${senderName}`,
            messageText,
            avatarUrl
          );
        }
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:update", handleMessageUpdate);
    socket.on("message:pin", handleMessagePinUpdate);
    socket.on("message:delete", handleMessageDelete);
    socket.on("message:notification", handleMessageNotification);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:update", handleMessageUpdate);
      socket.off("message:pin", handleMessagePinUpdate);
      socket.off("message:delete", handleMessageDelete);
      socket.off("message:notification", handleMessageNotification);
    };
  }, [socket, peer, user]);

  // Typing indicator listener
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ userId, isTyping }) => {
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

  useEffect(() => {
    setTypingUsers({});
  }, [peer]);

  const selectPeer = (selectedPeer) => {
    setPeer(selectedPeer);
  };

  const handleReaction = async (messageId, reaction) => {
    if (!socket) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              reactions: [
                ...(msg.reactions?.filter(
                  (r) => r.user !== user._id && r.user?._id !== user._id
                ) || []),
                { user: user._id, reaction },
              ],
            }
          : msg
      )
    );

    socket.emit("message:react", {
      messageId,
      reaction,
    });
  };

  // Add pin/unpin functions
  const handlePinMessage = async (messageId) => {
    if (!socket) return;

    try {
      const { data } = await api.post("/messages/pin", {
        messageId,
        isPinned: true,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned: true } : msg
        )
      );

      // Show notification
      showNotification("Message pinned", "success");
    } catch (error) {
      console.error("Pin message failed:", error);
      socket.emit("message:pin", { messageId, isPinned: true });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned: true } : msg
        )
      );
    }
  };

  const handleUnpinMessage = async (messageId) => {
    if (!socket) return;

    try {
      const { data } = await api.post("/messages/pin", {
        messageId,
        isPinned: false,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned: false } : msg
        )
      );

      // Show notification
      showNotification("Message unpinned", "info");
    } catch (error) {
      console.error("Unpin message failed:", error);
      socket.emit("message:pin", { messageId, isPinned: false });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned: false } : msg
        )
      );
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
      isPinned: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Show "sending" notification
    const sendingNotificationId = Date.now().toString();
    setNotifications((prev) => [
      ...prev,
      {
        id: sendingNotificationId,
        message: `Sending to ${peer.username}...`,
        type: "info",
      },
    ]);

    try {
      const { data } = await api.post("/messages/send", {
        to: peer._id,
        text: text,
      });

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? data : msg))
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== sendingNotificationId)
      );

      // Show sent confirmation
      const messagePreview =
        text.length > 30 ? text.substring(0, 30) + "..." : text;
      showNotification(`To ${peer.username}: ${messagePreview}`, "sent");
    } catch (error) {
      console.error("API failed, using socket");

      setNotifications((prev) =>
        prev.filter((n) => n.id !== sendingNotificationId)
      );
      showNotification(`Failed to send to ${peer.username}`, "error");

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
      isPinned: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    showNotification(`Uploading ${file.name} to ${peer.username}...`, "info");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("to", peer._id);

      const { data } = await api.post("/messages/send-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? data : msg))
      );

      // Show success notification
      showNotification(`File sent to ${peer.username}: ${file.name}`, "sent");
    } catch (error) {
      console.error("File upload failed:", error);

      // Show error notification
      showNotification(`Failed to send file to ${peer.username}`, "error");

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
        position: "relative",
      }}
    >
      {/* CSS Animation */}
      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-5px);
              opacity: 1;
            }
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Notification Container */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            avatar={notification.avatar}
            type={notification.type}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
            onClick={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
          />
        ))}
      </div>

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
            {/* Chat Window */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ChatWindow
                me={user}
                peer={peer}
                messages={enhancedMessages}
                setMessages={setMessages}
                onReaction={handleReaction}
                onPinMessage={handlePinMessage}
                onUnpinMessage={handleUnpinMessage}
                onDeleteMessage={handleDeleteMessage}
                onForwardMessage={handleForwardMessage}
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
