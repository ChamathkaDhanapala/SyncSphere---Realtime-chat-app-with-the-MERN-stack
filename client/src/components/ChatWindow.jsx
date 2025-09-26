import { useEffect, useRef } from "react";

export default function ChatWindow({ me, peer, messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0f172a",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg) => {
          let senderId = msg.sender;
          if (msg.sender && typeof msg.sender === "object") {
            senderId = msg.sender._id;
          }

          const isOwnMessage = senderId === me?._id;

          console.log("Message debug:", {
            messageId: msg._id,
            rawSender: msg.sender,
            extractedSenderId: senderId,
            currentUserId: me?._id,
            isOwnMessage: isOwnMessage,
            messageText: msg.text,
          });

          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: "18px",
                  backgroundColor: isOwnMessage ? "#3b82f6" : "#374151",
                  color: "white",
                  borderBottomRightRadius: isOwnMessage ? "4px" : "18px",
                  borderBottomLeftRadius: isOwnMessage ? "18px" : "4px",
                }}
              >
                <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: isOwnMessage ? "#bfdbfe" : "#9ca3af",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {formatTime(msg.createdAt)}
                  {isOwnMessage && " ✓"}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
