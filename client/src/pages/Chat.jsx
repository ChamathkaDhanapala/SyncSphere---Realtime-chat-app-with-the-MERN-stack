import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";
import { api } from "../lib/api.js";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  alpha
} from "@mui/material";
import {
  Chat as ChatIcon,
  Circle,
  Wifi
} from "@mui/icons-material";

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onNew = ({ message }) => {
      if ((peer && [user._id, peer._id].includes(message.sender)) || !peer) {
        setMessages(prev => [...prev, message]);
      }
    };
    socket.on("message:new", onNew);
    return () => { socket.off("message:new", onNew); };
  }, [socket, peer, user]);

  const selectPeer = async (u) => {
    setPeer(u);
    try {
      const { data } = await api.get(`/api/messages/${u._id}`);
      setMessages(data);
    } catch (error) {
      if (error.response?.status === 404) {
        setMessages([]);
      } else {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const send = (text) => {
    if (!peer || !socket) return;
    socket.emit("message:send", { to: peer._id, text });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            borderRadius: "50%",
            filter: "blur(40px)",
            opacity: 0.1,
            animation: "pulse 4s ease-in-out infinite"
          },
          "&::before": {
            top: -80,
            right: -80,
            width: 240,
            height: 240,
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            animationDelay: "0s"
          },
          "&::after": {
            bottom: -80,
            left: -80,
            width: 240,
            height: 240,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            animationDelay: "2s"
          },
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.1 },
            "50%": { opacity: 0.15 }
          }
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          height: "100vh",
          display: "flex"
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: 320,
            background: "linear-gradient(135deg, rgba(26, 31, 59, 0.95) 0%, rgba(45, 27, 78, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid",
            borderColor: alpha("#fff", 0.1),
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.3)"
          }}
        >
          <Sidebar onSelect={selectPeer} selectedId={peer?._id} />
        </Box>
        
        {/* Main Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: alpha("#000", 0.2)
          }}
        >
          {peer ? (
            <>
              {/* Chat Header */}
              <Paper
                elevation={0}
                sx={{
                  px: 4,
                  py: 3,
                  background: "linear-gradient(135deg, rgba(26, 31, 59, 0.95) 0%, rgba(45, 27, 78, 0.95) 100%)",
                  backdropFilter: "blur(20px)",
                  borderBottom: "1px solid",
                  borderColor: alpha("#fff", 0.1),
                  borderRadius: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 2
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "primary.main",
                      fontSize: "1.2rem",
                      fontWeight: 600
                    }}
                  >
                    {peer.username?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  {peer.online && (
                    <Circle
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        fontSize: "12px",
                        color: "#38a169",
                        bgcolor: "white",
                        borderRadius: "50%",
                        filter: "drop-shadow(0 0 2px #38a169)"
                      }}
                    />
                  )}
                </Box>
                
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "1.1rem"
                    }}
                  >
                    {peer.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: peer.online ? "#38a169" : alpha("#fff", 0.6),
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5
                    }}
                  >
                    <Circle sx={{ fontSize: "8px" }} />
                    {peer.online ? "Online" : "Offline"}
                  </Typography>
                </Box>
              </Paper>

              {/* Chat Window */}
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <ChatWindow me={user} peer={peer} messages={messages} />
              </Box>

              {/* Message Input */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, rgba(26, 31, 59, 0.95) 0%, rgba(45, 27, 78, 0.95) 100%)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid",
                  borderColor: alpha("#fff", 0.1)
                }}
              >
                <MessageInput onSend={send} />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: alpha("#000", 0.1),
                backdropFilter: "blur(10px)"
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: 100,
                    height: 100,
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 4,
                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)"
                  }}
                >
                  <ChatIcon sx={{ fontSize: 40, color: "white" }} />
                </Paper>
                <Typography
                  variant="h5"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    mb: 1,
                    fontSize: "1.5rem"
                  }}
                >
                  Welcome to SyncSphere
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha("#fff", 0.7),
                    mb: 0.5
                  }}
                >
                  Select a contact to start chatting
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Status Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 20
        }}
      >
        <Chip
          icon={<Wifi sx={{ fontSize: 16, color: "#38a169" }} />}
          label="Connected"
          sx={{
            background: alpha("#1a1f3b", 0.9),
            backdropFilter: "blur(20px)",
            border: "1px solid",
            borderColor: alpha("#fff", 0.1),
            color: "#38a169",
            fontWeight: 600,
            "& .MuiChip-icon": {
              color: "#38a169 !important"
            }
          }}
        />
      </Box>
    </Box>
  );
}