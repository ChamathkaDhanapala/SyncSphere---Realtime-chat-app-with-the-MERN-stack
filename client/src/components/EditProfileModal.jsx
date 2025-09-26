import { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef(null);

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
    console.log("File selected:", selectedFile); 
    
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setError("Please select an image file (JPEG, PNG, GIF)");
        return;
      }

      setFile(selectedFile);
      setError("");
      
  
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      console.log("Preview URL created:", objectUrl); // Debug log
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !isLoading) {
      fileInputRef.current.click();
    }
  };

  const onSave = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!updateProfile || typeof updateProfile !== 'function') {
      setError("Profile update functionality is not available.");
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
        console.log("Adding file to FormData:", file.name); // Debug log
      }

      console.log("FormData contents:");
      for (let [key, value] of fd.entries()) {
        console.log(key, value);
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
        
        if (status === 500) {
          setError("Server error: Unable to process your request. This might be a backend issue.");
        } else {
          setError(message || `Update failed (Error ${status}). Please try again.`);
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

  const handleImageError = (e) => {
    console.error("Image load error for URL:", e.target.src);
    if (e.target.src.includes('localhost:3000')) {
      const correctedUrl = e.target.src.replace('localhost:3000', 'localhost:5000');
      e.target.src = correctedUrl;
      return;
    }
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3B82F6&color=ffffff&size=64&bold=true`;
    e.target.src = fallbackUrl;
    setImageLoading(false);
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.avatarUrl) {
      let avatarUrl = user.avatarUrl;
      if (!avatarUrl.startsWith('http')) {
        avatarUrl = `http://localhost:5000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
      } else if (avatarUrl.includes('localhost:3000')) {
        avatarUrl = avatarUrl.replace('localhost:3000', 'localhost:5000');
      }
      return avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3B82F6&color=ffffff&size=64&bold=true`;
  };

  const handleCancel = () => {
    setError("");
    setFile(null);
    setPreviewUrl(user?.avatarUrl || null);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(user?.avatarUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Inline styles
  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    },
    modal: {
      backgroundColor: '#1f2937', borderRadius: '12px', width: '100%', maxWidth: '450px',
      border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    },
    header: {
      padding: '20px', borderBottom: '1px solid #374151', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center'
    },
    title: { color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 },
    subtitle: { color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' },
    closeBtn: {
      background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
      padding: '8px', borderRadius: '6px', fontSize: '18px'
    },
    content: { padding: '20px', maxHeight: '60vh', overflowY: 'auto' },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #dc2626',
      borderRadius: '8px', padding: '12px', color: '#fca5a5', fontSize: '14px', marginBottom: '16px'
    },
    avatarSection: {
      display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
      padding: '12px', backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '8px'
    },
    avatarPreview: {
      width: '80px', height: '80px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: 'white',
      fontWeight: '600', fontSize: '24px', overflow: 'hidden', flexShrink: 0
    },
    fileSection: { flex: 1 },
    fileLabel: { 
      display: 'block', color: '#d1d5db', fontSize: '14px', fontWeight: '500', marginBottom: '8px' 
    },
    fileUploadArea: {
      border: '2px dashed #4b5563', borderRadius: '8px', padding: '16px',
      textAlign: 'center', cursor: 'pointer', marginBottom: '8px',
      transition: 'border-color 0.2s'
    },
    fileInput: { display: 'none' },
    fileInfo: { fontSize: '12px', color: '#10b981' },
    removeBtn: {
      background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
      fontSize: '12px', textDecoration: 'underline', marginTop: '4px'
    },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' },
    input: {
      width: '100%', backgroundColor: '#111827', border: '1px solid #374151',
      borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px', boxSizing: 'border-box'
    },
    textarea: { resize: 'vertical', minHeight: '100px' },
    footer: { padding: '20px', borderTop: '1px solid #374151', display: 'flex', gap: '12px' },
    btn: {
      padding: '12px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px',
      cursor: 'pointer', border: 'none', flex: 1
    },
    btnSecondary: { backgroundColor: '#374151', color: '#d1d5db' },
    btnPrimary: { backgroundColor: '#3b82f6', color: 'white' },
    disabled: { opacity: 0.6, cursor: 'not-allowed' },
    loadingSpinner: {
      width: '16px', height: '16px', border: '2px solid transparent',
      borderTop: '2px solid white', borderRadius: '50%',
      animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px'
    }
  };

  const spinnerStyles = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

  return (
    <>
      <style>{spinnerStyles}</style>
      <div style={styles.overlay} onClick={handleCancel}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Edit Profile</h2>
              <p style={styles.subtitle}>Update your profile information</p>
            </div>
            <button style={styles.closeBtn} onClick={handleCancel} disabled={isLoading}>✕</button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {error && <div style={styles.error}>{error}</div>}

            {/* Avatar Section */}
            <div style={styles.avatarSection}>
              <div style={styles.avatarPreview}>
                {imageLoading ? (
                  <div style={styles.loadingSpinner}></div>
                ) : previewUrl || user?.avatarUrl ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Profile preview"
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    onLoad={() => setImageLoading(false)}
                    onError={handleImageError}
                  />
                ) : (
                  user?.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              
              <div style={styles.fileSection}>
                <label style={styles.fileLabel}>Profile Picture</label>
                <div 
                  style={styles.fileUploadArea}
                  onClick={triggerFileInput}
                  onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#4b5563'}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                    disabled={isLoading}
                  />
                  {file ? (
                    <div>
                      <div>✅ {file.name}</div>
                      <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '4px'}}>
                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button 
                        type="button"
                        style={styles.removeBtn}
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div>📁 Click to upload new image</div>
                      <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '4px'}}>
                        PNG, JPG, GIF up to 5MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Username */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Display Name *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{...styles.input, ...(isLoading ? styles.disabled : {})}}
                placeholder="Enter your display name"
                disabled={isLoading}
              />
            </div>

            {/* Bio */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{...styles.input, ...styles.textarea, ...(isLoading ? styles.disabled : {})}}
                placeholder="Tell us something about yourself..."
                disabled={isLoading}
                rows="4"
              />
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              onClick={handleCancel}
              style={{...styles.btn, ...styles.btnSecondary, ...(isLoading ? styles.disabled : {})}}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              style={{...styles.btn, ...styles.btnPrimary, ...((isLoading || !username.trim()) ? styles.disabled : {})}}
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (<><span style={styles.loadingSpinner}></span> Saving...</>) : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}