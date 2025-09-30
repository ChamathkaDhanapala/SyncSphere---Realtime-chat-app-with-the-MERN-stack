import { useState, useRef, useEffect } from "react";
import EmojiPicker from "./EmojiPicker";

export default function MessageInput({ onSend, onFileSend, socket, peer }) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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

  const placeholderText = peer?.username 
    ? `Message ${peer.username}...`
    : "Type a message...";

  const styles = {
    container: {
      padding: "16px 20px",
      backgroundColor: "#1f2937",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
    form: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      maxWidth: "800px",
      margin: "0 auto",
    },
    inputContainer: {
      flex: 1,
      position: "relative",
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
      transition: "all 0.2s ease",
    },
    inputContainerFocused: {
      borderColor: "#3b82f6",
      background: "rgba(255, 255, 255, 0.08)",
    },
    textarea: {
      flex: 1,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "white",
      padding: "12px 16px",
      borderRadius: "20px",
      resize: "none",
      maxHeight: "100px",
      fontFamily: "inherit",
      fontSize: "14px",
      lineHeight: "1.4",
      fontWeight: "400",
    },
    sendButton: {
      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "12px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      flexShrink: 0,
      minWidth: "70px",
      height: "44px",
      boxShadow: "0 2px 10px rgba(59, 130, 246, 0.3)",
    },
    sendButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    },
    sendButtonDisabled: {
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#6b7280",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    fileButton: {
      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "10px",
      borderRadius: "10px",
      fontSize: "18px",
      transition: "all 0.2s ease",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
      boxShadow: "0 2px 10px rgba(139, 92, 246, 0.3)",
    },
    fileButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
    },
    emojiButton: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "10px",
      borderRadius: "10px",
      fontSize: "18px",
      transition: "all 0.2s ease",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
      boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)",
    },
    emojiButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
    },
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={styles.fileButton}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, styles.fileButtonHover);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, styles.fileButton);
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
          trigger={
            <button
              type="button"
              style={styles.emojiButton}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.emojiButtonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, styles.emojiButton);
              }}
            >
              😊
            </button>
          }
        />

        {/* Message Input */}
        <div
          style={{
            ...styles.inputContainer,
            ...(isFocused ? styles.inputContainerFocused : {}),
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderText}
            style={styles.textarea}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            ...styles.sendButton,
            ...(!text.trim() ? styles.sendButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (text.trim()) {
              Object.assign(e.target.style, styles.sendButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, styles.sendButton);
          }}
        >
          {text.trim() ? (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              Send
              <span style={{ fontSize: "14px" }}>🚀</span>
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}