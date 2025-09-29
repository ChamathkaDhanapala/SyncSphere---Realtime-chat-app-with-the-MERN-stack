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
  return useContext(SocketCtx);
}

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineMap, setOnlineMap] = useState(new Map());
  const [isOnline, setIsOnline] = useState(false);
  const onlineRef = useRef(new Map());

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setIsOnline(false);
      return;
    }

    const s = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Socket connected");
      setIsOnline(true);
    });

    s.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsOnline(false);
    });

    s.on("presence:update", ({ userId, online, lastSeen }) => {
      console.log("👥 Presence update:", userId, online);
      const m = new Map(onlineRef.current);
      if (online) m.set(userId, true);
      else m.delete(userId);

      onlineRef.current = m;
      setOnlineMap(m);
    });

    return () => {
      s.disconnect();
    };
  }, [token]);

  const value = useMemo(() => {
    const isUserOnline = (userId) => onlineMap.has(userId);
    return { socket, isOnline, isOnline: isUserOnline };
  }, [socket, onlineMap, isOnline]);

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}
