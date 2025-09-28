import { useEffect, useRef, useState } from "react";
import InfoComponent from "./InfoComponent"; 
import MessageReactions from "./MessageReactions";

export default function ChatWindow({ me, peer, messages, onReaction }) {
  const endRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [openReactionMenu, setOpenReactionMenu] = useState(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvatarUrl = (user, size = 32) => {
    if (!user?.avatarUrl) return null;
    let avatarUrl = user.avatarUrl;
    if (!avatarUrl.startsWith('http')) {
      avatarUrl = `http://localhost:5000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    }
    return avatarUrl;
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
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #374151',
            cursor: onClick ? 'pointer' : 'default'
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
          borderRadius: '50%',
          backgroundColor: '#4b5563',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: size * 0.4,
          border: '2px solid #374151',
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
      >
        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  const handleToggleReaction = (messageId, e) => {
    if (e) e.stopPropagation();
    setOpenReactionMenu(openReactionMenu === messageId ? null : messageId);
  };

  const handleReactionSelect = (messageId, reaction) => {
    console.log("Reaction selected:", messageId, reaction);
    onReaction(messageId, reaction);
    setOpenReactionMenu(null);
  };


  useEffect(() => {
    const handleClickOutside = () => {
      setOpenReactionMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
          <Avatar 
            user={peer} 
            size={40} 
            onClick={() => setShowInfo(true)}
          />
          <div>
            <div style={{ color: "white", fontWeight: "600", fontSize: "16px" }}>
              {peer?.username || "Unknown User"}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
              {peer?.online ? "Online" : "Offline"}
            </div>
          </div>
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
          onClick={() => setOpenReactionMenu(null)} // Close menu when clicking in messages area
        >
          {messages.map((msg) => {
            let senderId = msg.sender;
            if (msg.sender && typeof msg.sender === "object") {
              senderId = msg.sender._id;
            }

            const isOwnMessage = senderId === me?._id;
            const hasReactions = msg.reactions && msg.reactions.length > 0;

            return (
              <div
                key={msg._id}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                }}
              >
                {/* Avatar for peer messages */}
                {!isOwnMessage && <Avatar user={peer} size={32} />}

                {/* Message Bubble Container */}
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    alignItems: isOwnMessage ? "flex-end" : "flex-start",
                    position: 'relative'
                  }}
                >
                  {/* Sender Name */}
                  {!isOwnMessage && (
                    <div style={{ color: "#9ca3af", fontSize: "12px", paddingLeft: "12px" }}>
                      {peer?.username}
                    </div>
                  )}

                  {/* Message Bubble with Reaction Trigger */}
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "18px",
                        backgroundColor: isOwnMessage ? "#3b82f6" : "#374151",
                        color: "white",
                        borderBottomRightRadius: isOwnMessage ? "4px" : "18px",
                        borderBottomLeftRadius: isOwnMessage ? "18px" : "4px",
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        // Show reaction trigger on hover
                        const trigger = e.currentTarget.querySelector('.reaction-trigger');
                        if (trigger) trigger.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        // Hide reaction trigger if menu not open
                        const trigger = e.currentTarget.querySelector('.reaction-trigger');
                        if (trigger && openReactionMenu !== msg._id) {
                          trigger.style.opacity = '0';
                        }
                      }}
                    >
                      <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                        {msg.text}
                      </div>

                      {/* Reaction Trigger */}
                      <button
                        className="reaction-trigger"
                        onClick={(e) => handleToggleReaction(msg._id, e)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          [isOwnMessage ? 'left' : 'right']: '-24px',
                          transform: 'translateY(-50%)',
                          background: '#1f2937',
                          border: '1px solid #374151',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          fontSize: '16px',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                      >
                        ♥
                      </button>
                    </div>

                    {/* Reaction Picker Menu */}
                    {openReactionMenu === msg._id && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '100%', 
                        [isOwnMessage ? 'right' : 'left']: '0',
                        marginBottom: '8px',
                        zIndex: 1000
                      }}>
                        <MessageReactions
                          message={msg}
                          onReact={handleReactionSelect}
                          currentUserId={me._id}
                          isOpen={true}
                          onToggle={() => handleToggleReaction(msg._id)}
                          position={isOwnMessage ? 'right' : 'left'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Display Existing Reactions */}
                  {hasReactions && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '4px', 
                      flexWrap: 'wrap',
                      marginTop: '2px',
                      padding: '0 4px'
                    }}>
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
                            backgroundColor: '#1f2937',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            border: '1px solid #374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <span>{reaction}</span>
                          {count > 1 && <span style={{ fontSize: '10px' }}>{count}</span>}
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
                    }}
                  >
                    {formatTime(msg.createdAt)}
                    {isOwnMessage && " ✓"}
                  </div>
                </div>

                {/* Avatar for own messages */}
                {isOwnMessage && <Avatar user={me} size={32} />}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Info Component */}
      <InfoComponent 
        user={peer} 
        open={showInfo} 
        onClose={() => setShowInfo(false)} 
      />
    </>
  );
}