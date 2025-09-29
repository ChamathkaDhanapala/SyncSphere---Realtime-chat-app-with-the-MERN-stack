import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  Refresh,
  Search,
  Block,
  CheckCircle,
  AdminPanelSettings,
  Person,
  Delete,
  Security,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.isAdmin) fetchUsers();
  }, [user]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log("📊 Users state updated:", {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      admins: users.filter(u => u.isAdmin).length,
    });
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Fetching users...");

      // Try admin endpoint first
      try {
        const adminResponse = await api.get("/admin/users");
        console.log("✅ Admin users endpoint successful:", adminResponse.data);
        
        if (adminResponse.data && adminResponse.data.users) {
          setUsers(adminResponse.data.users);
          return;
        }
      } catch (adminErr) {
        console.log("❌ Admin users endpoint failed, falling back to regular endpoint...");
      }

      // Fallback to regular users endpoint
      const response = await api.get("/users");
      console.log("✅ Users fetched successfully:", response.data);

      if (response.data && response.data.users) {
        setUsers(response.data.users);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("❌ Unexpected response format:", response.data);
        setError("Unexpected response format from server");
      }
    } catch (err) {
      console.error("❌ Fetch users error:", err);

      if (err.response?.status === 404) {
        setError("Admin endpoint not found. Please check your server routes.");
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have admin privileges.");
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to fetch users";
        setError("Failed to fetch users: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      console.log(`🔄 Toggling status for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      
      const response = await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      console.log("✅ Status update response:", response.data);

      setSuccess(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
      
      // Update the local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        )
      );
      
    } catch (err) {
      console.error("❌ Status update error:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update user status";
      setError(errorMessage);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      console.log(`🔄 Toggling admin status for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      
      const response = await api.put(`/admin/users/${userId}/role`, {
        isAdmin: !currentStatus,
      });
      console.log("✅ Admin update response:", response.data);

      setSuccess(`Admin privileges ${!currentStatus ? "granted" : "revoked"} successfully`);
      
      // Update the local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isAdmin: !currentStatus }
            : user
        )
      );
      
    } catch (err) {
      console.error("❌ Admin update error:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update admin status";
      setError(errorMessage);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      console.log(`🔄 Deleting user ${userId}`);
      
      const response = await api.delete(`/admin/users/${userId}`);
      console.log("✅ Delete response:", response.data);

      setSuccess("User deleted successfully");
      
      // Update the local state immediately
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
    } catch (err) {
      console.error("❌ Delete error:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to delete user";
      setError(errorMessage);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!user?.isAdmin) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: 4,
              background: "rgba(30, 41, 59, 0.9)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              textAlign: "center",
            }}
          >
            <Security sx={{ fontSize: 64, color: "#ef4444", mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
              Access Denied
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Admin privileges required to access this page.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#3b82f6" }} size={60} />
        <Typography variant="body1" sx={{ color: "white" }}>
          Loading admin dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 2,
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: "white",
                  background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Admin Dashboard
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Manage users and system settings
              </Typography>
            </Box>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={fetchUsers}
                sx={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                  color: "white",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    transform: "rotate(180deg)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Search and Stats */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ position: "relative", flex: 1, minWidth: 300 }}>
              <Search
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  zIndex: 1,
                  fontSize: 20,
                }}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    pl: 4,
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(59, 130, 246, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "white",
                    fontSize: "0.875rem",
                    "&::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "0.875rem",
                    },
                  },
                }}
              />
            </Box>

            {/* Stats */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Paper
                sx={{
                  p: 1.5,
                  minWidth: 100,
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#22c55e", fontWeight: 700 }}
                >
                  {users.filter((u) => u.isActive).length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Active
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 1.5,
                  minWidth: 100,
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#3b82f6", fontWeight: 700 }}
                >
                  {users.filter((u) => u.isAdmin).length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Admins
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 1.5,
                  minWidth: 100,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  {users.length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Total
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 2,
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{
              mb: 2,
              borderRadius: "8px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#86efac",
            }}
          >
            {success}
          </Alert>
        )}

        {/* Users Table */}
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      py: 1.5,
                    }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      py: 1.5,
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      py: 1.5,
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      py: 1.5,
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      py: 1.5,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow
                    key={u._id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "white", py: 1.5 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            backgroundColor: u.isActive ? "#3b82f6" : "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "13px",
                          }}
                        >
                          {u.username?.charAt(0)?.toUpperCase()}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "white", fontWeight: 500 }}
                          >
                            {u.username}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                          >
                            ID: {u._id?.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "rgba(255, 255, 255, 0.8)", py: 1.5 }}>
                      {u.email}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        icon={u.isActive ? <CheckCircle /> : <Block />}
                        label={u.isActive ? "Active" : "Inactive"}
                        color={u.isActive ? "success" : "error"}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: u.isActive ? "#22c55e" : "#ef4444",
                          color: u.isActive ? "#22c55e" : "#ef4444",
                          background: u.isActive
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        icon={u.isAdmin ? <AdminPanelSettings /> : <Person />}
                        label={u.isAdmin ? "Admin" : "User"}
                        color={u.isAdmin ? "primary" : "default"}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: u.isAdmin ? "#3b82f6" : "#6b7280",
                          color: u.isAdmin
                            ? "#3b82f6"
                            : "rgba(255, 255, 255, 0.7)",
                          background: u.isAdmin
                            ? "rgba(59, 130, 246, 0.1)"
                            : "rgba(255, 255, 255, 0.05)",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        <Tooltip
                          title={
                            u.isActive ? "Deactivate User" : "Activate User"
                          }
                        >
                          <Button
                            size="small"
                            startIcon={
                              u.isActive ? <VisibilityOff /> : <Visibility />
                            }
                            onClick={() => toggleUserStatus(u._id, u.isActive)}
                            disabled={u._id === user._id}
                            sx={{
                              background: u.isActive
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(34, 197, 94, 0.1)",
                              color: u.isActive ? "#f59e0b" : "#22c55e",
                              border: `1px solid ${
                                u.isActive ? "#f59e0b" : "#22c55e"
                              }`,
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              px: 1,
                              "&:hover": {
                                background: u.isActive
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : "rgba(34, 197, 94, 0.2)",
                              },
                              "&:disabled": {
                                opacity: 0.5,
                                cursor: "not-allowed",
                              },
                            }}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title={u.isAdmin ? "Remove Admin" : "Make Admin"}
                        >
                          <Button
                            size="small"
                            startIcon={<AdminPanelSettings />}
                            onClick={() => toggleAdminStatus(u._id, u.isAdmin)}
                            disabled={u._id === user._id}
                            sx={{
                              background: u.isAdmin
                                ? "rgba(99, 102, 241, 0.1)"
                                : "rgba(59, 130, 246, 0.1)",
                              color: u.isAdmin ? "#6366f1" : "#3b82f6",
                              border: `1px solid ${
                                u.isAdmin ? "#6366f1" : "#3b82f6"
                              }`,
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              px: 1,
                              "&:hover": {
                                background: u.isAdmin
                                  ? "rgba(99, 102, 241, 0.2)"
                                  : "rgba(59, 130, 246, 0.2)",
                              },
                              "&:disabled": {
                                opacity: 0.5,
                                cursor: "not-allowed",
                              },
                            }}
                          >
                            {u.isAdmin ? "Remove" : "Make Admin"}
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <Button
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => deleteUser(u._id)}
                            disabled={u._id === user._id}
                            sx={{
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              border: "1px solid #ef4444",
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              px: 1,
                              "&:hover": {
                                background: "rgba(239, 68, 68, 0.2)",
                              },
                              "&:disabled": {
                                opacity: 0.5,
                                cursor: "not-allowed",
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredUsers.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              <Search sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No users found
              </Typography>
              <Typography variant="body2">
                {users.length === 0
                  ? "No users in the system"
                  : "Try adjusting your search terms"}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}