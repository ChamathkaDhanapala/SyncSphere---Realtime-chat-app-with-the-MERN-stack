import { useState, useEffect } from "react";
import { api } from "../lib/api.js";

const ForwardModal = ({ messages, onForward, onClose, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      const filteredUsers = data.filter((user) => user._id !== currentUser._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u._id === user._id)) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleForward = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      const messageIds = messages.map((msg) => msg._id);
      const toUsers = selectedUsers.map((user) => user._id);

      await onForward(messageIds, toUsers);
      onClose();
    } catch (error) {
      console.error("Forward failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarUrl = (user) => {
    if (!user?.avatarUrl) return null;
    let avatarUrl = user.avatarUrl;
    if (!avatarUrl.startsWith("http")) {
      avatarUrl = `http://localhost:5000${
        avatarUrl.startsWith("/") ? "" : "/"
      }${avatarUrl}`;
    }
    return avatarUrl;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "12px",
          padding: "24px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "white", margin: 0 }}>
            Forward Message{messages.length > 1 ? "s" : ""}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "18px",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Selected Messages Preview */}
        <div
          style={{
            backgroundColor: "#374151",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          <div
            style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "8px" }}
          >
            Forwarding {messages.length} message{messages.length > 1 ? "s" : ""}
            :
          </div>
          {messages.slice(0, 3).map((msg, index) => (
            <div
              key={msg._id}
              style={{ color: "white", fontSize: "13px", marginBottom: "4px" }}
            >
              {msg.text.length > 50
                ? msg.text.substring(0, 50) + "..."
                : msg.text}
            </div>
          ))}
          {messages.length > 3 && (
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
              +{messages.length - 3} more messages
            </div>
          )}
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            backgroundColor: "#374151",
            border: "1px solid #4b5563",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "white",
            fontSize: "14px",
            marginBottom: "16px",
            outline: "none",
          }}
        />

        {/* Users List */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedUsers.find((u) => u._id === user._id)
                  ? "#374151"
                  : "transparent",
                border: selectedUsers.find((u) => u._id === user._id)
                  ? "1px solid #3b82f6"
                  : "1px solid transparent",
                marginBottom: "4px",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#4b5563",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {user.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {user.username}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                  {user.online ? "Online" : "Offline"}
                </div>
              </div>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: "2px solid #6b7280",
                  backgroundColor: selectedUsers.find((u) => u._id === user._id)
                    ? "#3b82f6"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedUsers.find((u) => u._id === user._id) && (
                  <span style={{ color: "white", fontSize: "12px" }}>✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "1px solid #374151",
              color: "#9ca3af",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedUsers.length === 0 || isLoading}
            style={{
              flex: 1,
              backgroundColor:
                selectedUsers.length === 0 ? "#374151" : "#3b82f6",
              border: "none",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              cursor: selectedUsers.length === 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Forwarding..." : `Forward to ${selectedUsers.length}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
