import { useEffect, useRef } from "react";
import { format } from "date-fns";

export default function ChatWindow({ me, peer, messages }) {
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
        <img src={peer?.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${peer?.username||"U"}`} className="w-8 h-8 rounded-full" />
        <div>
          <div className="font-medium">{peer?.username}</div>
          <div className="text-xs text-slate-400">{peer?.online ? "Online" : "Offline"}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div key={m._id} className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.sender === me?._id ? "ml-auto bg-emerald-600/30" : "bg-slate-800"}`}>
            <div className="text-sm">{m.text}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 text-right">{format(new Date(m.createdAt), "p")}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
