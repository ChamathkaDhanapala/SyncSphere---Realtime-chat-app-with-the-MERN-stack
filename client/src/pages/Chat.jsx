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
            {/* Chat Header */}
            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "#1f2937",
                borderBottom: "1px solid #374151",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {peer.username?.charAt(0)?.toUpperCase()}
                </div>
                {isOnline(peer._id) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#10b981",
                      border: "2px solid #1f2937",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </div>
              <div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {peer.username}
                </div>
                <div
                  style={{
                    color: isOnline(peer._id) ? "#10b981" : "#9ca3af",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      backgroundColor: isOnline(peer._id)
                        ? "#10b981"
                        : "#9ca3af",
                      borderRadius: "50%",
                    }}
                  />
                  {isOnline(peer._id) ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ChatWindow me={user} peer={peer} messages={messages} />
            </div>

            {/* Message Input */}
            <div
              style={{
                backgroundColor: "#1f2937",
                borderTop: "1px solid #374151",
              }}
            >
              <MessageInput onSend={sendMessage} />
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
