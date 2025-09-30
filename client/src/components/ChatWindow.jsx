import { useEffect, useRef, useState } from "react";
import InfoComponent from "./InfoComponent";
import MessageReactions from "./MessageReactions";
import { api } from "../lib/api.js";
import PinnedMessages from "./PinnedMessages";
import ForwardModal from "./ForwardModal";

export default function ChatWindow({
  me,
  peer,
  messages,
  setMessages,
  onReaction,
  onPinMessage,
  onUnpinMessage,
  onDeleteMessage,
  onForwardMessage,
}) {
  const endRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [openReactionMenu, setOpenReactionMenu] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [localMessages, setLocalMessages] = useState(messages);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);

  // Sync with parent messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = localMessages
      .map((message, index) => ({
        message,
        index,
        positions: getAllIndexes(message.text.toLowerCase(), term),
      }))
      .filter((result) => result.positions.length > 0);

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  }, [searchTerm, localMessages]);

  // Function to find all occurrences of search term
  const getAllIndexes = (text, searchTerm) => {
    const indexes = [];
    let index = text.indexOf(searchTerm);
    while (index !== -1) {
      indexes.push(index);
      index = text.indexOf(searchTerm, index + 1);
    }
    return indexes;
  };

  // Navigate through search results
  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      newIndex =
        (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    }

    setCurrentResultIndex(newIndex);
    scrollToMessage(searchResults[newIndex].index);
  };

  // Scroll to specific message
  const scrollToMessage = (messageIndex) => {
    const messageElement = document.querySelector(
      `[data-message-index="${messageIndex}"]`
    );
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      messageElement.style.backgroundColor = "rgba(245, 158, 11, 0.2)";
      setTimeout(() => {
        messageElement.style.backgroundColor = "";
      }, 2000);
    }
  };

  // Focus search input when search is opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvatarUrl = (user, size = 32) => {
    if (!user?.avatarUrl) return null;
    let avatarUrl = user.avatarUrl;
    if (!avatarUrl.startsWith("http")) {
      avatarUrl = `http://localhost:5000${
        avatarUrl.startsWith("/") ? "" : "/"
      }${avatarUrl}`;
    }
    return avatarUrl;
  };

  // Function to get file URL
  const getFileUrl = (file) => {
    if (!file?.url) return null;
    let fileUrl = file.url;
    if (!fileUrl.startsWith("http")) {
      fileUrl = `http://localhost:5000${
        fileUrl.startsWith("/") ? "" : "/"
      }${fileUrl}`;
    }
    return fileUrl;
  };

  const Avatar = ({ user, size = 32, onClick }) => {
    const [imageError, setImageError] = useState(false);
    const avatarUrl = getAvatarUrl(user);

    if (avatarUrl && !imageError) {
      return (
        <img
          src={avatarUrl}
          alt={user?.username}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #374151",
            cursor: onClick ? "pointer" : "default",
          }}
          onError={() => setImageError(true)}
          onClick={onClick}
        />
      );
    }

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "#4b5563",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: size * 0.4,
          border: "2px solid #374151",
          cursor: onClick ? "pointer" : "default",
        }}
        onClick={onClick}
      >
        {user?.username?.charAt(0)?.toUpperCase() || "U"}
      </div>
    );
  };

  // Render file message content
  const renderFileContent = (msg) => {
    const fileUrl = getFileUrl(msg.file);

    if (!fileUrl) {
      return <div>File not available</div>;
    }

    // Check if it's an image
    const isImage =
      msg.file?.mimetype?.startsWith("image/") ||
      msg.file?.originalName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <img
            src={fileUrl}
            alt={msg.file.originalName}
            style={{
              maxWidth: "300px",
              maxHeight: "300px",
              borderRadius: "12px",
              objectFit: "cover",
              border: "1px solid #374151",
            }}
            onError={(e) => {
              console.error("Failed to load image:", fileUrl);
              e.target.style.display = "none";
            }}
          />
          <div style={{ fontSize: "12px", color: "#d1d5db" }}>
            {msg.file.originalName}
          </div>
        </div>
      );
    }

    // For non-image files, show a file download link
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px",
        }}
      >
        <div style={{ fontSize: "24px" }}>📎</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <a
            href={fileUrl}
            download={msg.file.originalName}
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            {msg.file.originalName}
          </a>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            {(msg.file.size / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>
    );
  };

  const handleToggleReaction = (messageId, e) => {
    if (e) e.stopPropagation();
    setOpenReactionMenu(openReactionMenu === messageId ? null : messageId);
  };

  const handleReactionSelect = (messageId, reaction) => {
    onReaction(messageId, reaction);
    setOpenReactionMenu(null);
  };

  // Handle message actions (right click/long press)
  const handleMessageAction = (messageId, action, e) => {
    if (e) e.stopPropagation();
    setShowMessageMenu(null);

    switch (action) {
      case "delete":
        setShowDeleteMenu(messageId);
        break;
      case "forward":
        setSelectedMessages([messageId]);
        setShowForwardModal(true);
        break;
      case "pin":
        onPinMessage(messageId);
        break;
      case "unpin":
        onUnpinMessage(messageId);
        break;
      default:
        break;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (messageId, deleteForEveryone) => {
    onDeleteMessage(messageId, deleteForEveryone);
    setShowDeleteMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenReactionMenu(null);
      setShowMessageMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Pin/Unpin message function
  const handlePinMessage = (messageId) => {
    if (onPinMessage) {
      onPinMessage(messageId);
    }
  };

  const handleUnpinMessage = (messageId) => {
    if (onUnpinMessage) {
      onUnpinMessage(messageId);
    }
  };

  // Get pinned messages
  const pinnedMessages = localMessages.filter((msg) => msg.isPinned);
  const pinnedMessagesCount = pinnedMessages.length;

  // Highlight search term in message text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const term = searchTerm.toLowerCase();
    const lowerText = text.toLowerCase();
    const parts = [];
    let lastIndex = 0;
    let index = lowerText.indexOf(term);

    while (index !== -1) {
      parts.push(text.substring(lastIndex, index));
      parts.push(
        <mark
          key={index}
          style={{
            backgroundColor: "#f59e0b",
            color: "#1f2937",
            padding: "1px 2px",
            borderRadius: "2px",
          }}
        >
          {text.substring(index, index + term.length)}
        </mark>
      );
      lastIndex = index + term.length;
      index = lowerText.indexOf(term, lastIndex);
    }

    parts.push(text.substring(lastIndex));
    return parts;
  };

  // Render deleted message
  const renderDeletedMessage = (msg, isOwnMessage) => {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "18px",
          backgroundColor: isOwnMessage ? "#374151" : "#374151",
          color: "#9ca3af",
          borderBottomRightRadius: isOwnMessage ? "4px" : "18px",
          borderBottomLeftRadius: isOwnMessage ? "18px" : "4px",
          fontStyle: "italic",
          border: "1px dashed #6b7280",
        }}
      >
        <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
          {msg.deletedBy?.includes(me._id)
            ? "You deleted this message"
            : "This message was deleted"}
        </div>
      </div>
    );
  };

  // Render forwarded message
  const renderForwardedMessage = (msg, text) => {
    return (
      <div>
        <div
          style={{
            color: "#3b82f6",
            fontSize: "12px",
            fontWeight: "500",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>↩️</span>
          <span>Forwarded</span>
        </div>
        <div>{text}</div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "#0f172a",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #374151",
            backgroundColor: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Avatar user={peer} size={40} onClick={() => setShowInfo(true)} />
          <div style={{ flex: 1 }}>
            <div
              style={{ color: "white", fontWeight: "600", fontSize: "16px" }}
            >
              {peer?.username || "Unknown User"}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
              {peer?.online ? "Online" : "Offline"}
            </div>
          </div>

          {/* Search Bar */}
          {showSearch ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#374151",
                padding: "6px 12px",
                borderRadius: "20px",
                minWidth: "200px",
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  flex: 1,
                  minWidth: "120px",
                }}
              />

              {/* Search Results Counter */}
              {searchResults.length > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentResultIndex + 1}/{searchResults.length}
                </div>
              )}

              {/* Search Navigation Buttons */}
              {searchResults.length > 0 && (
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => navigateSearchResults("prev")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: "2px 4px",
                      borderRadius: "4px",
                    }}
                    title="Previous result"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => navigateSearchResults("next")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: "2px 4px",
                      borderRadius: "4px",
                    }}
                    title="Next result"
                  >
                    ▼
                  </button>
                </div>
              )}

              {/* Close Search Button */}
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "2px",
                }}
                title="Close search"
              >
                ✕
              </button>
            </div>
          ) : (
            /* Search Toggle Button */
            <button
              onClick={() => setShowSearch(true)}
              style={{
                background: "none",
                border: "1px solid #374151",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "14px",
                padding: "8px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              title="Search messages"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#374151";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#9ca3af";
              }}
            >
              <span>🔍</span>
              <span>Search</span>
            </button>
          )}

          {/* Pinned Messages Button */}
          {pinnedMessagesCount > 0 && !showSearch && (
            <button
              onClick={() => setShowPinnedMessages(true)}
              style={{
                background: "none",
                border: "1px solid #374151",
                color: "#f59e0b",
                cursor: "pointer",
                fontSize: "14px",
                padding: "8px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#374151";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <span>📌</span>
              <span>{pinnedMessagesCount}</span>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          onClick={() => {
            setOpenReactionMenu(null);
            setHoveredMessage(null);
            setShowMessageMenu(null);
          }}
        >
          {localMessages.map((msg, index) => {
            let senderId = msg.sender;
            if (msg.sender && typeof msg.sender === "object") {
              senderId = msg.sender._id;
            }

            const isOwnMessage = senderId === me?._id;
            const hasReactions = msg.reactions && msg.reactions.length > 0;
            const isHovered = hoveredMessage === msg._id;
            const isCurrentSearchResult =
              searchResults[currentResultIndex]?.index === index;
            const isDeleted = msg.isDeleted || msg.deletedBy?.includes(me._id);
            const isFileMessage = msg.file && !isDeleted;

            return (
              <div
                key={msg._id}
                data-message-id={msg._id}
                data-message-index={index}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  backgroundColor: isCurrentSearchResult
                    ? "rgba(245, 158, 11, 0.2)"
                    : "transparent",
                  borderRadius: "8px",
                  padding: isCurrentSearchResult ? "4px" : "0",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={() => setHoveredMessage(msg._id)}
                onMouseLeave={() => setHoveredMessage(null)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (!isDeleted) {
                    setShowMessageMenu(msg._id);
                  }
                }}
              >
                {!isOwnMessage && <Avatar user={peer} size={32} />}

                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    alignItems: isOwnMessage ? "flex-end" : "flex-start",
                    position: "relative",
                  }}
                >
                  {!isOwnMessage && (
                    <div
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                        paddingLeft: "12px",
                      }}
                    >
                      {peer?.username}
                    </div>
                  )}

                  {/* Message Container */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isOwnMessage ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Message Bubble */}
                    {isDeleted ? (
                      renderDeletedMessage(msg, isOwnMessage)
                    ) : isFileMessage ? (
                      // File/Image Message
                      <div
                        style={{
                          padding: "12px",
                          borderRadius: "18px",
                          backgroundColor: isOwnMessage ? "#3b82f6" : "#374151",
                          color: "white",
                          borderBottomRightRadius: isOwnMessage
                            ? "4px"
                            : "18px",
                          borderBottomLeftRadius: isOwnMessage ? "18px" : "4px",
                          position: "relative",
                        }}
                      >
                        {renderFileContent(msg)}
                      </div>
                    ) : (
                      // Text Message
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: "18px",
                          backgroundColor: isOwnMessage ? "#3b82f6" : "#374151",
                          color: "white",
                          borderBottomRightRadius: isOwnMessage
                            ? "4px"
                            : "18px",
                          borderBottomLeftRadius: isOwnMessage ? "18px" : "4px",
                          position: "relative",
                          minWidth: "60px",
                        }}
                      >
                        <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                          {msg.isForwarded
                            ? renderForwardedMessage(msg, msg.text)
                            : searchTerm
                            ? highlightText(msg.text, searchTerm)
                            : msg.text}
                        </div>
                      </div>
                    )}

                    {/* Pin/Unpin Button - Show on hover */}
                    {isHovered && !isDeleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (msg.isPinned) {
                            handleUnpinMessage(msg._id);
                          } else {
                            handlePinMessage(msg._id);
                          }
                        }}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          [isOwnMessage ? "right" : "left"]: "8px",
                          background: "rgba(31, 41, 55, 0.9)",
                          border: "1px solid #374151",
                          color: msg.isPinned ? "#f59e0b" : "white",
                          cursor: "pointer",
                          fontSize: "10px",
                          padding: "4px",
                          borderRadius: "6px",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          zIndex: 5,
                        }}
                        title={msg.isPinned ? "Unpin message" : "Pin message"}
                      >
                        {msg.isPinned ? "📌" : "📍"}
                      </button>
                    )}
                  </div>

                  {/* Message Actions Menu */}
                  {showMessageMenu === msg._id && !isDeleted && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        [isOwnMessage ? "right" : "left"]: "0",
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        padding: "8px",
                        zIndex: 1000,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        minWidth: "120px",
                      }}
                    >
                      <button
                        onClick={(e) =>
                          handleMessageAction(msg._id, "forward", e)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#374151")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <span>↩️</span>
                        Forward
                      </button>

                      <button
                        onClick={(e) =>
                          handleMessageAction(
                            msg._id,
                            msg.isPinned ? "unpin" : "pin",
                            e
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#374151")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <span>{msg.isPinned ? "📌" : "📍"}</span>
                        {msg.isPinned ? "Unpin" : "Pin"}
                      </button>

                      <button
                        onClick={(e) =>
                          handleMessageAction(msg._id, "delete", e)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#374151")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Reaction Trigger Button - Only show on hover for non-deleted messages */}
                  {isHovered && !isDeleted && (
                    <button
                      className="reaction-trigger"
                      onClick={(e) => handleToggleReaction(msg._id, e)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        [isOwnMessage ? "left" : "right"]: "-20px",
                        transform: "translateY(-50%)",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: "14px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        transition: "all 0.2s",
                      }}
                      title="Add reaction"
                    >
                      ♥
                    </button>
                  )}

                  {/* Reaction Picker Menu */}
                  {openReactionMenu === msg._id && !isDeleted && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        [isOwnMessage ? "right" : "left"]: "0",
                        marginBottom: "8px",
                        zIndex: 1000,
                      }}
                    >
                      <MessageReactions
                        message={msg}
                        onReact={handleReactionSelect}
                        currentUserId={me._id}
                        isOpen={true}
                        onToggle={() => handleToggleReaction(msg._id)}
                        position={isOwnMessage ? "right" : "left"}
                      />
                    </div>
                  )}
                </div>

                {/* Display Existing Reactions */}
                {hasReactions && !isDeleted && (
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      flexWrap: "wrap",
                      marginTop: "2px",
                      padding: "0 4px",
                    }}
                  >
                    {Object.entries(
                      msg.reactions.reduce((acc, reaction) => {
                        const reactionType = reaction.reaction;
                        acc[reactionType] = (acc[reactionType] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([reaction, count]) => (
                      <div
                        key={reaction}
                        style={{
                          backgroundColor: "#1f2937",
                          padding: "2px 6px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          border: "1px solid #374151",
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <span>{reaction}</span>
                        {count > 1 && (
                          <span style={{ fontSize: "10px" }}>{count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Time Stamp */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {formatTime(msg.createdAt)}
                  {isOwnMessage && !isDeleted && " ✓"}
                  {msg.isPinned && !isDeleted && " 📌"}
                  {msg.isForwarded && !isDeleted && " ↩️"}
                </div>
                {isOwnMessage && <Avatar user={me} size={32} />}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Pinned Messages Modal */}
      {showPinnedMessages && (
        <PinnedMessages
          messages={localMessages}
          onUnpin={handleUnpinMessage}
          onClose={() => setShowPinnedMessages(false)}
          currentUserId={me._id}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteMenu && (
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
              padding: "20px",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ color: "white", marginBottom: "12px" }}>
              Delete Message
            </h3>
            <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
              Are you sure you want to delete this message?
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <button
                onClick={() => handleDeleteConfirm(showDeleteMenu, true)}
                style={{
                  backgroundColor: "#ef4444",
                  border: "none",
                  color: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Delete for Everyone
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteMenu, false)}
                style={{
                  backgroundColor: "#374151",
                  border: "none",
                  color: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Delete for Me
              </button>
              <button
                onClick={() => setShowDeleteMenu(null)}
                style={{
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
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <ForwardModal
          messages={selectedMessages.map((id) =>
            localMessages.find((msg) => msg._id === id)
          )}
          onForward={onForwardMessage}
          onClose={() => {
            setShowForwardModal(false);
            setSelectedMessages([]);
          }}
          currentUser={me}
        />
      )}

      <InfoComponent
        user={peer}
        open={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </>
  );
}
