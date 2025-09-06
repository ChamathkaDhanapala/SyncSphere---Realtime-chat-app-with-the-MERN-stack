import { useEffect, useState } from "react";
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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gray-800 rounded-full blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 h-screen flex">
        {/* Sidebar - Made more visible */}
        <div className="w-80 bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl">
          <Sidebar onSelect={selectPeer} selectedId={peer?._id} />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {peer ? (
            <>
              {/* Chat Header */}
              <div className="bg-gray-800/80 border-b border-gray-700/50 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {peer.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">{peer.username}</h2>
                    <p className="text-gray-300 text-sm"> 
                      {peer.online ? (
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Online
                        </span>
                      ) : (
                        <span className="text-gray-400"> 
                          Offline
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 overflow-hidden bg-gray-900/50">
                <ChatWindow me={user} peer={peer} messages={messages} />
              </div>

              {/* Message Input */}
              <div className="bg-gray-800/80 border-t border-gray-700/50 p-4">
                <MessageInput onSend={send} />
              </div>
            </>
          ) : (
            <div className="h-full grid place-items-center bg-gray-900/40">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to SyncSphere</h3>
                <p className="text-gray-300 mb-1">Select a contact to start chatting</p> 
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-xl px-3 py-2 rounded-xl border border-gray-700/50">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-200">Connected</span> 
        </div>
      </div>
    </div>
  );
}