import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";
import { api } from "../lib/api.js";

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(()=>{
    if (!socket) return;
    const onNew = ({ message }) => {
      // if it's part of current conversation, append
      if ((peer && [user._id, peer._id].includes(message.sender)) || !peer) {
        setMessages(prev => [...prev, message]);
      }
    };
    socket.on("message:new", onNew);
    return () => { socket.off("message:new", onNew); };
  }, [socket, peer, user]);

  const selectPeer = async (u) => {
    setPeer(u);
    const { data } = await api.get(`/api/messages/${u._id}`);
    setMessages(data);
  };

  const send = (text) => {
    if (!peer || !socket) return;
    socket.emit("message:send", { to: peer._id, text });
  };

  return (
    <div className="h-screen grid grid-cols-[20rem_1fr]">
      <Sidebar onSelect={selectPeer} selectedId={peer?._id} />
      <div className="flex flex-col">
        {peer ? (
          <>
            <ChatWindow me={user} peer={peer} messages={messages} />
            <MessageInput onSend={send} />
          </>
        ) : (
          <div className="h-full grid place-items-center">
            <div className="text-slate-400">Select a person to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
}
