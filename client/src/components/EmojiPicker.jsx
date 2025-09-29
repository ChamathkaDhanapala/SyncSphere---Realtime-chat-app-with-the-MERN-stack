import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

const EmojiPickerButton = ({
  onEmojiSelect,
  position = "top",
  trigger = "😃",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      ref={pickerRef}
    >
      {/* Custom Trigger Button */}
      <button
        onClick={handleTriggerClick}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "8px",
          transition: "all 0.2s",
          transform: isOpen ? "scale(1.1)" : "scale(1)",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#374151";
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          if (!isOpen) {
            e.target.style.transform = "scale(1)";
          }
        }}
      >
        {trigger}
      </button>

      {/* Emoji Picker */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            [position === "top" ? "bottom" : "top"]: "100%",
            left: 0,
            zIndex: 1000,
            marginTop: position === "top" ? 0 : "8px",
            marginBottom: position === "top" ? "8px" : 0,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            previewConfig={{
              showPreview: false,
            }}
            searchDisabled={false}
            skinTonesDisabled={true}
            theme="dark"
            lazyLoadEmojis={true}
            suggestedEmojisMode="frequent"
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerButton;
