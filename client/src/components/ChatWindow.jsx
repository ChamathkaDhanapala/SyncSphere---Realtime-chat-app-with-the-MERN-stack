import { useEffect, useRef, useState } from "react";
import InfoComponent from "./InfoComponent"; 

export default function ChatWindow({ me, peer, messages }) {
  const endRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

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

  // Avatar component
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
        {/* Chat Header with Peer Info */}
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
        >
          {messages.map((msg) => {
            let senderId = msg.sender;
            if (msg.sender && typeof msg.sender === "object") {
              senderId = msg.sender._id;
            }

            const isOwnMessage = senderId === me?._id;

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
                {/* Avatar for peer messages (left side) */}
                {!isOwnMessage && (
                  <Avatar user={peer} size={32} />
                )}

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    alignItems: isOwnMessage ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Sender Name for peer messages */}
                  {!isOwnMessage && (
                    <div style={{ color: "#9ca3af", fontSize: "12px", paddingLeft: "8px" }}>
                      {peer?.username}
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    style={{
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
                  </div>

                  {/* Time Stamp */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      padding: "0 8px",
                    }}
                  >
                    {formatTime(msg.createdAt)}
                    {isOwnMessage && " ✓"}
                  </div>
                </div>

                {/* Avatar for own messages (right side) */}
                {isOwnMessage && (
                  <Avatar user={me} size={32} />
                )}
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