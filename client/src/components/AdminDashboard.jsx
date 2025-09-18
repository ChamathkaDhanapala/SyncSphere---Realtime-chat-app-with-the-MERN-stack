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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.isAdmin) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Fetching users from /users/admin");
      
      const response = await api.get("/users/admin");
      console.log("✅ Users fetched successfully:", response.data);
      
      // Handle different response formats
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
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message || 
                          "Failed to fetch users";
      setError("Failed to fetch users: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      console.log(`🔄 Toggling status for user ${userId}`);
      await api.put(`/users/admin/${userId}/status`, {
        isActive: !currentStatus,
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Status update error:", err);
      const errorMessage = err.response?.data?.message || "Failed to update user status";
      setError(errorMessage);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      console.log(`🔄 Toggling admin status for user ${userId}`);
      await api.put(`/users/admin/${userId}/admin`, {
        isAdmin: !currentStatus,
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Admin update error:", err);
      const errorMessage = err.response?.data?.message || "Failed to update admin status";
      setError(errorMessage);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      console.log(`🔄 Deleting user ${userId}`);
      await api.delete(`/users/admin/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("❌ Delete error:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete user";
      setError(errorMessage);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.isAdmin) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search users"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button onClick={fetchUsers} variant="outlined">
          Refresh
        </Button>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.isActive ? "Active" : "Inactive"}
                      color={u.isActive ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.isAdmin ? "Admin" : "User"}
                      color={u.isAdmin ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color={u.isActive ? "warning" : "success"}
                      onClick={() => toggleUserStatus(u._id, u.isActive)}
                      sx={{ mr: 1 }}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="small"
                      color={u.isAdmin ? "secondary" : "primary"}
                      onClick={() => toggleAdminStatus(u._id, u.isAdmin)}
                      sx={{ mr: 1 }}
                    >
                      {u.isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteUser(u._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}