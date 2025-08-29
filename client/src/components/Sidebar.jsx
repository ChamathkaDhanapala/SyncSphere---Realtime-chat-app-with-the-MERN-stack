import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Avatar from "./Avatar.jsx";
import EditProfileModal from "./EditProfileModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";

export default function Sidebar({ onSelect, selectedId }) {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const { user, logout, refreshMe } = useAuth();
  const { isOnline } = useSocket();

  useEffect(() => {
    refreshMe();
    api.get("/api/users").then(({ data }) => setUsers(data));
  }, [refreshMe]);

  return (
    <div className="h-full w-80 border-r border-slate-800 flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <Avatar url={user?.avatarUrl} size={8} online={true} />
        <div className="flex-1">
          <div className="font-medium">{user?.username}</div>
          <div className="text-xs text-slate-400">{user?.email}</div>
        </div>
        <button onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800">Edit</button>
        <button onClick={logout} className="ml-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700">Logout</button>
      </div>

      <div className="p-2">
        <input placeholder="Search people..." className="w-full p-2 rounded-xl" onChange={(e)=>{
          const q = e.target.value.toLowerCase();
          api.get("/api/users").then(({ data }) => setUsers(data.filter(u=>u.username.toLowerCase().includes(q))));
        }} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.map(u => (
          <button key={u._id} onClick={()=>onSelect(u)} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-900 ${selectedId===u._id ? "bg-slate-900" : ""}`}>
            <Avatar url={u.avatarUrl} size={7} online={isOnline(u._id)} />
            <div className="flex-1">
              <div className="font-medium">{u.username}</div>
              <div className="text-xs text-slate-400">{isOnline(u._id) ? "Online" : "Offline"}</div>
            </div>
          </button>
        ))}
      </div>
      <EditProfileModal open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
