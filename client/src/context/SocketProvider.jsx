import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketCtx = createContext(null);
export function useSocket() { return useContext(SocketCtx); }

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineMap, setOnlineMap] = useState(new Map());
  const onlineRef = useRef(new Map());

  useEffect(() => {
    if (!token) { setSocket(null); return; }
    const s = io(import.meta.env.VITE_API_URL || "http://localhost:5000", { auth: { token } });
    setSocket(s);
    s.on("presence:update", ({ userId, online, lastSeen }) => {
      const m = new Map(onlineRef.current);
      if (online) m.set(userId, true); else m.delete(userId);
      onlineRef.current = m;
      setOnlineMap(m);
    });
    return () => { s.disconnect(); };
  }, [token]);

  const isOnline = (userId) => onlineMap.has(userId);

  const value = useMemo(() => ({ socket, isOnline }), [socket, onlineMap]);
  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>
}
