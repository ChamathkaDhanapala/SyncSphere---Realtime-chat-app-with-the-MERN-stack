import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function EditProfileModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!open) return null;

  const onSave = async () => {
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("username", username);
      fd.append("bio", bio);
      if (file) fd.append("avatar", file);
      await updateProfile(fd);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md my-8" // Added my-8 for vertical margin
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header  */}
        <div className="sticky top-0 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-gray-700/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-5">
          {/* Current Avatar Preview */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-white font-medium">Current Avatar</p>
              <p className="text-gray-400 text-sm">Upload a new image below</p>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Display Name</label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your display name"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bio</label>
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)}
              rows="3"
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Tell us something about yourself..."
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Profile Picture</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="avatar-upload"
              />
              <label 
                htmlFor="avatar-upload"
                className="block w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 cursor-pointer hover:bg-gray-700/70 transition-all duration-200 border-dashed"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>{file ? file.name : "Choose an image..."}</span>
                </div>
              </label>
            </div>
            {file && (
              <p className="text-green-400 text-sm">
                ✓ Ready to upload: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-gray-800/90 backdrop-blur-xl border-t border-gray-700/50 p-6 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}