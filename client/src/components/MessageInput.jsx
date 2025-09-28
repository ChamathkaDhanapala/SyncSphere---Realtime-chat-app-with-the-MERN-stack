import { useState, useRef } from "react";

export default function MessageInput({ onSend, onFileSend }) {
  const [text, setText] = useState("");
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (onFileSend) {
        onFileSend(file);
      }
      e.target.value = '';
    }
    setIsFileMenuOpen(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileMenuToggle = () => {
    setIsFileMenuOpen(!isFileMenuOpen);
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎬';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div style={{
      padding: "16px 20px",
      borderTop: "1px solid #374151",
      backgroundColor: "#1f2937",
      position: "relative"
    }}>
      {/* File Input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />

      {/* File Menu Popup */}
      {isFileMenuOpen && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "20px",
          backgroundColor: "#374151",
          border: "1px solid #4b5563",
          borderRadius: "12px",
          padding: "8px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          minWidth: "150px"
        }}>
          <div style={{
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 12px",
            borderBottom: "1px solid #4b5563",
            marginBottom: "4px"
          }}>
            Send File
          </div>
          
          <button
            onClick={triggerFileInput}
            style={{
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "transparent",
              border: "none",
              color: "#d1d5db",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "6px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#4b5563"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            📎 File
          </button>
          
          <button
            onClick={() => {
              triggerFileInput();
              // Set accept to images only
              if (fileInputRef.current) {
                fileInputRef.current.accept = "image/*";
              }
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "transparent",
              border: "none",
              color: "#d1d5db",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "6px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#4b5563"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            🖼️ Photo
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* File Attachment Button */}
        <button
          onClick={handleFileMenuToggle}
          style={{
            padding: "12px",
            backgroundColor: "#374151",
            border: "none",
            borderRadius: "50%",
            color: "white",
            cursor: "pointer",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#4b5563"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#374151"}
        >
          📎
        </button>

        {/* Text Input */}
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
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
          onBlur={(e) => e.target.style.borderColor = "#4b5563"}
        />

        {/* Send Button */}
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
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => {
            if (text.trim()) e.target.style.backgroundColor = "#2563eb";
          }}
          onMouseLeave={(e) => {
            if (text.trim()) e.target.style.backgroundColor = "#3b82f6";
          }}
        >
          Send
        </button>
      </div>

      {/* Click outside to close file menu */}
      {isFileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsFileMenuOpen(false)}
        />
      )}
    </div>
  );
}