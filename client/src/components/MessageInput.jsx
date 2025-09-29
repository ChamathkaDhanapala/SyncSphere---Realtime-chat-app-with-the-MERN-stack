import { useState, useRef, useEffect } from "react";
import EmojiPicker from "./EmojiPicker";

export default function MessageInput({ onSend, onFileSend, socket, peer }) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size too large. Please select a file smaller than 10MB.");
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "File type not supported. Please select an image, PDF, or document file."
      );
      return;
    }

    onFileSend(file);
    event.target.value = "";
  };

  // Define handleSubmit before it's used
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSend(text);
    setText("");

    // Stop typing indicator
    if (socket && peer) {
      socket.emit("user:typing", { to: peer._id, isTyping: false });
      setIsTyping(false);
    }
  };

  // Define handleEmojiSelect
  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Typing indicator logic
  useEffect(() => {
    if (!socket || !peer) return;

    let typingTimeout;

    const handleTyping = () => {
      if (!isTyping) {
        socket.emit("user:typing", { to: peer._id, isTyping: true });
        setIsTyping(true);
      }

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("user:typing", { to: peer._id, isTyping: false });
        setIsTyping(false);
      }, 1000);
    };

    if (text.trim()) {
      handleTyping();
    } else {
      socket.emit("user:typing", { to: peer._id, isTyping: false });
      setIsTyping(false);
    }

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [text, socket, peer, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  return (
    <div
      style={{
        padding: "16px 20px",
        backgroundColor: "#1f2937",
        borderTop: "1px solid #374151",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            fontSize: "20px",
            transition: "background-color 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#374151";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          📎
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
        />

        {/* Emoji Picker */}
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          position="top"
          trigger="😃"
        />

        {/* Message Input */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundColor: "#374151",
            borderRadius: "24px",
            border: "1px solid #4b5563",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              padding: "12px 16px",
              borderRadius: "24px",
              resize: "none",
              maxHeight: "120px",
              fontFamily: "inherit",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            background: text.trim() ? "#3b82f6" : "#374151",
            border: "none",
            color: "white",
            cursor: text.trim() ? "pointer" : "not-allowed",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background-color 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (text.trim()) {
              e.target.style.backgroundColor = "#2563eb";
            }
          }}
          onMouseLeave={(e) => {
            if (text.trim()) {
              e.target.style.backgroundColor = "#3b82f6";
            }
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
