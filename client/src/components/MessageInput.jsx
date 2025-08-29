import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="flex gap-2 p-3 border-t border-slate-800">
      <input className="flex-1 p-3 rounded-xl" placeholder="Type a message..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} />
      <button onClick={send} className="px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400">Send</button>
    </div>
  );
}
