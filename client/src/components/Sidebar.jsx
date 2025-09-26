import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import EditProfileModal from "./EditProfileModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketProvider.jsx";
import { Link } from "react-router-dom";

const SimpleAvatar = ({ user, online, size = 40 }) => {
  const [imageError, setImageError] = useState(false);

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null;
    
    let avatarUrl = user.avatarUrl;
    
    if (!avatarUrl.startsWith('http')) {
      avatarUrl = `http://localhost:5000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    } else if (avatarUrl.includes('localhost:3000')) {
      avatarUrl = avatarUrl.replace('localhost:3000', 'localhost:5000');
    }
    
    return avatarUrl;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={user?.username}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #374151'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#4b5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: size * 0.4,
            border: '2px solid #374151'
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
      {online && (
        <div 
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 12,
            height: 12,
            backgroundColor: '#10b981',
            border: '2px solid #1f2937',
            borderRadius: '50%'
          }}
        />
      )}
    </div>
  );
};

export default function Sidebar({ onSelect, selectedId }) {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, refreshMe } = useAuth();
  const { isOnline } = useSocket();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/users");
        setUsers(response.data.users || response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    refreshMe();
    fetchUsers();
  }, [refreshMe, refreshTrigger]);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inline styles object
  const styles = {
    sidebar: {
      width: '320px',
      height: '100vh',
      backgroundColor: '#1f2937',
      borderRight: '1px solid #374151',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #374151'
    },
    userInfo: {
      flex: 1,
      minWidth: 0
    },
    username: {
      color: 'white',
      fontWeight: '600',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      margin: 0,
      fontSize: '14px'
    },
    email: {
      color: '#9ca3af',
      fontSize: '12px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      margin: 0
    },
    button: {
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #4b5563',
      color: '#d1d5db',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '12px'
    },
    adminLink: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #374151',
      color: '#60a5fa',
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: '14px'
    },
    searchContainer: {
      padding: '12px',
      borderBottom: '1px solid #374151'
    },
    searchBox: {
      position: 'relative'
    },
    searchIcon: {
      position: 'absolute',
      top: '50%',
      left: '12px',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    searchInput: {
      width: '100%',
      padding: '8px 8px 8px 36px',
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '6px',
      color: 'white',
      outline: 'none',
      fontSize: '14px'
    },
    contactsHeader: {
      padding: '12px 16px',
      borderBottom: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#9ca3af'
    },
    onlineCount: {
      color: '#60a5fa',
      fontWeight: '500'
    },
    userList: {
      flex: 1,
      overflowY: 'auto'
    },
    userButton: {
      width: '100%',
      textAlign: 'left',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: 'none',
      cursor: 'pointer',
      borderRight: '3px solid transparent'
    },
    userButtonSelected: {
      backgroundColor: '#1e40af'
    },
    userInfoText: {
      flex: 1,
      minWidth: 0
    },
    userStatus: {
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%'
    },
    footer: {
      padding: '12px',
      borderTop: '1px solid #374151',
      backgroundColor: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#9ca3af'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'white'
    },
    errorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      gap: '8px'
    },
    errorText: {
      color: '#f87171'
    },
    retryButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      backgroundColor: '#374151',
      color: '#d1d5db',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px'
    }
  };

  if (loading) {
    return (
      <div style={styles.sidebar}>
        <div style={styles.loadingContainer}>
          <div>Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.sidebar}>
        <div style={styles.errorContainer}>
          <div style={styles.errorText}>{error}</div>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.sidebar}>
      {/* User Profile Header */}
      <div style={styles.header}>
        <SimpleAvatar user={user} online={true} size={40} />
        <div style={styles.userInfo}>
          <div style={styles.username}>{user?.username}</div>
          <div style={styles.email}>{user?.email}</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={styles.button}
          title="Edit Profile"
        >
          Edit
        </button>
        <button
          onClick={logout}
          style={{...styles.button, backgroundColor: '#374151', border: 'none'}}
          title="Logout"
        >
          Logout
        </button>
      </div>

      {/* Admin Dashboard Link */}
      {user && user.isAdmin && (
        <Link 
          to="/admin/dashboard"
          style={styles.adminLink}
        >
          <span>⚙️</span>
          <span style={{ fontWeight: '500' }}>Admin Dashboard</span>
        </Link>
      )}

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <div style={styles.searchIcon}>🔍</div>
          <input
            placeholder="Search people..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts Header */}
      <div style={styles.contactsHeader}>
        <span>Contacts</span>
        <span style={styles.onlineCount}>
          {filteredUsers.filter(u => isOnline(u._id)).length} online
        </span>
      </div>

      {/* Users List */}
      <div style={styles.userList}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '8px' }}>
              {users.length === 0 ? "No users found" : "No matching users"}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              {users.length === 0 ? "The users list is empty" : "Try a different search term"}
            </div>
          </div>
        ) : (
          filteredUsers.map(u => (
            <button
              key={u._id}
              onClick={() => onSelect(u)}
              style={{
                ...styles.userButton,
                ...(selectedId === u._id ? styles.userButtonSelected : {}),
                borderRightColor: selectedId === u._id ? '#3b82f6' : 'transparent'
              }}
            >
              <SimpleAvatar user={u} online={isOnline(u._id)} size={40} />
              <div style={styles.userInfoText}>
                <div style={styles.username}>
                  {u.username}
                </div>
                <div style={styles.userStatus}>
                  {isOnline(u._id) ? (
                    <>
                      <div style={{...styles.statusDot, backgroundColor: '#10b981'}}></div>
                      <span style={{ color: '#10b981' }}>Online</span>
                    </>
                  ) : (
                    <span style={{ color: '#6b7280' }}>Offline</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Connection Status */}
      <div style={styles.footer}>
        <span>Connection</span>
        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{...styles.statusDot, backgroundColor: '#10b981'}}></div>
          Connected
        </span>
      </div>

      <EditProfileModal
        open={open}
        onClose={() => setOpen(false)}
        onProfileUpdated={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}