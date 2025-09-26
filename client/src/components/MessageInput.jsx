import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: "16px 20px",
      borderTop: "1px solid #374151"
    }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: "#374151",
            border: "1px solid #4b5563",
            borderRadius: "20px",
            color: "white",
            fontSize: "14px",
            outline: "none"
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            padding: "12px 24px",
            backgroundColor: text.trim() ? "#3b82f6" : "#374151",
            color: "white",
            border: "none",
            borderRadius: "20px",
            cursor: text.trim() ? "pointer" : "not-allowed",
            opacity: text.trim() ? 1 : 0.5,
            fontWeight: "500"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}