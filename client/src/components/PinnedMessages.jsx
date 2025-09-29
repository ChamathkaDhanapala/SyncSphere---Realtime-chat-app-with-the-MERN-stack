import { useEffect, useState } from "react";

const PinnedMessages = ({ messages, onUnpin, onClose, currentUserId }) => {
  const pinnedMessages = messages.filter((msg) => msg.isPinned);

  const handleUnpin = async (messageId) => {
    if (onUnpin) {
      await onUnpin(messageId);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (pinnedMessages.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "12px",
          padding: "24px",
          zIndex: 1000,
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📌</div>
          <h3 style={{ color: "white", marginBottom: "8px" }}>
            No Pinned Messages
          </h3>
          <p style={{ color: "#9ca3af" }}>
            Pin important messages to find them easily later.
          </p>
          <button
            onClick={onClose}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "12px",
        padding: "20px",
        zIndex: 1000,
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid #374151",
        }}
      >
        <h3 style={{ color: "white", margin: 0 }}>
          📌 Pinned Messages ({pinnedMessages.length})
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {pinnedMessages.map((message) => (
          <div
            key={message._id}
            style={{
              backgroundColor: "#374151",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #4b5563",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "8px",
              }}
            >
              <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                {message.sender?.username || "Unknown User"}
              </div>
              <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                {formatTime(message.createdAt)}
              </div>
            </div>

            <div
              style={{
                color: "white",
                marginBottom: "12px",
                lineHeight: "1.4",
              }}
            >
              {message.text}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => handleUnpin(message._id)}
                style={{
                  background: "none",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ef4444";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#ef4444";
                }}
              >
                Unpin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedMessages;
