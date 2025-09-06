import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Avatar from "./Avatar.jsx";
import EditProfileModal from "./EditProfileModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";

export default function Sidebar({ onSelect, selectedId }) {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, refreshMe } = useAuth();
  const { isOnline } = useSocket();

  useEffect(() => {
    refreshMe();
    api.get("/users").then(({ data }) => setUsers(data));
  }, [refreshMe]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-80 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col">
      {/* User Profile Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-700/50">
        <Avatar url={user?.avatarUrl} size={10} online={true} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">{user?.username}</div>
          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
        </div>
        <button 
          onClick={() => setOpen(true)} 
          className="px-3 py-1.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
          title="Edit Profile"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          onClick={logout} 
          className="px-3 py-1.5 rounded-xl bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 transition-all duration-200"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            placeholder="Search people..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Online Status Counter */}
      <div className="px-4 py-2 border-b border-gray-700/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Contacts</span>
          <span className="text-blue-400 font-medium">
            {filteredUsers.filter(u => isOnline(u._id)).length} online
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No users found</div>
            <div className="text-gray-500 text-sm">Try a different search term</div>
          </div>
        ) : (
          filteredUsers.map(u => (
            <button 
              key={u._id} 
              onClick={() => onSelect(u)} 
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                selectedId === u._id 
                  ? "bg-blue-600/20 border-r-2 border-blue-500" 
                  : "hover:bg-gray-700/50"
              }`}
            >
              <Avatar url={u.avatarUrl} size={9} online={isOnline(u._id)} />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{u.username}</div>
                <div className="text-xs flex items-center">
                  {isOnline(u._id) ? (
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Online
                    </span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )}
                </div>
              </div>
              {selectedId === u._id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Connection Status */}
      <div className="p-3 border-t border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Connection</span>
          <span className="text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
            Connected
          </span>
        </div>
      </div>

      <EditProfileModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}