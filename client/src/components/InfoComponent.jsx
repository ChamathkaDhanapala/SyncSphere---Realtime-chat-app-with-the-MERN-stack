import { useState } from "react";

export default function InfoComponent({ user, open, onClose }) {
  if (!open) return null;

  // Function to get avatar URL
  const getAvatarUrl = (user, size = 32) => {
    if (!user?.avatarUrl) return null;

    let avatarUrl = user.avatarUrl;

    if (!avatarUrl.startsWith("http")) {
      avatarUrl = `http://localhost:5000${
        avatarUrl.startsWith("/") ? "" : "/"
      }${avatarUrl}`;
    }

    return avatarUrl;
  };

  const handleImageError = (e) => {
    console.error("Image load error for URL:", e.target.src);
    if (e.target.src.includes("localhost:3000")) {
      const correctedUrl = e.target.src.replace(
        "localhost:3000",
        "localhost:5000"
      );
      e.target.src = correctedUrl;
      return;
    }
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.username || "U"
    )}&background=3B82F6&color=ffffff&size=150&bold=true`;
    e.target.src = fallbackUrl;
  };

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      backgroundColor: "#1f2937",
      borderRadius: "12px",
      width: "100%",
      maxWidth: "400px",
      border: "1px solid #374151",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
      maxHeight: "90vh",
      overflow: "hidden",
    },
    header: {
      padding: "20px",
      borderBottom: "1px solid #374151",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#111827",
    },
    title: {
      color: "white",
      fontSize: "18px",
      fontWeight: "600",
      margin: 0,
    },
    closeBtn: {
      background: "none",
      border: "none",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "6px",
      fontSize: "18px",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      padding: "20px",
      overflowY: "auto",
    },
    avatarSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "24px",
    },
    avatar: {
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid #3b82f6",
      marginBottom: "16px",
    },
    username: {
      color: "white",
      fontSize: "24px",
      fontWeight: "600",
      margin: "0 0 8px 0",
      textAlign: "center",
    },
    status: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: user?.online ? "#10b981" : "#9ca3af",
      fontSize: "14px",
    },
    statusDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: user?.online ? "#10b981" : "#9ca3af",
    },
    infoSection: {
      backgroundColor: "rgba(31, 41, 55, 0.5)",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
    },
    sectionTitle: {
      color: "#d1d5db",
      fontSize: "14px",
      fontWeight: "500",
      margin: "0 0 12px 0",
    },
    bio: {
      color: "white",
      fontSize: "14px",
      lineHeight: "1.5",
      margin: 0,
    },
    noBio: {
      color: "#9ca3af",
      fontStyle: "italic",
      fontSize: "14px",
    },
    detailItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #374151",
    },
    detailLabel: {
      color: "#9ca3af",
      fontSize: "14px",
    },
    detailValue: {
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
    },
    footer: {
      padding: "16px 20px",
      borderTop: "1px solid #374151",
      backgroundColor: "#111827",
      textAlign: "center",
    },
    memberSince: {
      color: "#9ca3af",
      fontSize: "12px",
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Profile Information</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Avatar Section */}
          <div style={styles.avatarSection}>
            {user?.avatarUrl ? (
              <img
                src={getAvatarUrl(user)}
                alt={user?.username}
                style={styles.avatar}
                onError={handleImageError}
              />
            ) : (
              <div
                style={{
                  ...styles.avatar,
                  backgroundColor: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "48px",
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <h3 style={styles.username}>{user?.username || "Unknown User"}</h3>

            <div style={styles.status}>
              <div style={styles.statusDot}></div>
              {user?.online ? "Online" : "Offline"}
            </div>
          </div>

          {/* Bio Section */}
          <div style={styles.infoSection}>
            <h4 style={styles.sectionTitle}>About</h4>
            {user?.bio ? (
              <p style={styles.bio}>{user.bio}</p>
            ) : (
              <p style={styles.noBio}>No bio available</p>
            )}
          </div>

          {/* Details Section */}
          <div style={styles.infoSection}>
            <h4 style={styles.sectionTitle}>Details</h4>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Username:</span>
              <span style={styles.detailValue}>{user?.username || "N/A"}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Status:</span>
              <span
                style={{
                  ...styles.detailValue,
                  color: user?.online ? "#10b981" : "#ef4444",
                }}
              >
                {user?.online ? "Online" : "Offline"}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>User ID:</span>
              <span
                style={{
                  ...styles.detailValue,
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              >
                {user?._id ? user._id.substring(0, 8) + "..." : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.memberSince}>
            {user?.createdAt
              ? `Member since ${formatDate(user.createdAt)}`
              : "Member since unknown"}
          </div>
        </div>
      </div>
    </div>
  );
}
