import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function EditProfileModal({ open, onClose, onProfileUpdated }) {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);


  useEffect(() => {
    if (open) {
      setUsername(user?.username || "");
      setBio(user?.bio || "");
      setFile(null);
      setPreviewUrl(user?.avatarUrl || null);
      setError("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }

      setFile(selectedFile);
      setError("");
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const onSave = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setImageLoading(true);
    setError("");
    
    try {
      const fd = new FormData();
      fd.append("username", username.trim());
      fd.append("bio", bio.trim());
      
      if (file) {
        fd.append("avatar", file);
      }

      console.log("📤 Sending profile update...");

      for (let [key, value] of fd.entries()) {
        console.log(`📝 ${key}:`, value);
      }

      const result = await updateProfile(fd);
      console.log("✅ Profile update successful:", result);

      if (onProfileUpdated) {
        onProfileUpdated();
      }

      onClose();
    } catch (error) {
      console.error("❌ Update error details:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            setError(message || "Invalid request. Please check your input.");
            break;
          case 401:
            setError("Please login again. Your session may have expired.");
            break;
          case 413:
            setError("File too large. Please select a smaller image.");
            break;
          case 415:
            setError("Invalid file type. Please select a JPEG, PNG, or GIF image.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(message || `Update failed (${status}). Please try again.`);
        }
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
      setImageLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setFile(null);
    setPreviewUrl(user?.avatarUrl || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={handleCancel}
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
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Current Avatar Preview */}
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-xl overflow-hidden">
              {imageLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover"
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    console.error("Image load error");
                    e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
                    setImageLoading(false);
                  }}
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="text-white font-medium">Profile Picture</p>
              <p className="text-gray-400 text-sm">
                {file ? "New image selected" : "Current profile picture"}
              </p>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Display Name *</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your display name"
              disabled={isLoading}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows="3"
              className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Tell us something about yourself..."
              disabled={isLoading}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Profile Picture</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="avatar-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="avatar-upload"
                className={`block w-full p-3 border rounded-xl cursor-pointer transition-all duration-200 border-dashed ${
                  isLoading 
                    ? 'bg-gray-600/50 border-gray-500 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-700/70'
                }`}
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
                ✓ Ready to upload: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-gray-800/90 backdrop-blur-xl border-t border-gray-700/50 p-6 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading || !username.trim()}
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