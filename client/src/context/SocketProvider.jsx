import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketCtx = createContext(null);

export function useSocket() {
  const context = useContext(SocketCtx);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineMap, setOnlineMap] = useState(new Map());
  const onlineRef = useRef(new Map());
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      console.log("❌ No token or user, disconnecting socket");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    if (!socketRef.current || socketRef.current.disconnected) {
      console.log("🔄 Creating new socket connection for user:", user._id);

      const newSocket = io(
        process.env.REACT_APP_API_URL || "http://localhost:5000",
        {
          auth: { token },
          transports: ["websocket", "polling"],
        }
      );

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Socket connected, ID:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setIsConnected(false);
      });

      newSocket.on("presence:update", ({ userId, online, lastSeen }) => {
        console.log("👥 Presence update:", userId, online);
        const m = new Map(onlineRef.current);
        if (online) {
          m.set(userId, true);
        } else {
          m.delete(userId);
        }
        onlineRef.current = m;
        setOnlineMap(m);
      });

      newSocket.connect();
    }

    return () => {};
  }, [token, user]);

  const value = useMemo(() => {
    const isUserOnline = (userId) => {
      return onlineMap.has(userId);
    };

    return {
      socket,
      isOnline: isConnected,
      isOnline: isUserOnline,
    };
  }, [socket, isConnected, onlineMap]);

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}
