import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch,
  Alert,
  CircularProgress
} from "@mui/material";
import { Block, CheckCircle, Delete, AdminPanelSettings } from "@mui/icons-material";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      
      if (response.ok) {
        // Update local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isActive: !isActive } : u
        ));
      } else {
        setError("Failed to update user");
      }
    } catch (error) {
      setError("Server error");
    }
  };

  const toggleAdminStatus = async (userId, isAdmin) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ isAdmin: !isAdmin })
      });
      
      if (response.ok) {
        // Update local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isAdmin: !isAdmin } : u
        ));
      } else {
        setError("Failed to update user");
      }
    } catch (error) {
      setError("Server error");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        setError("Failed to delete user");
      }
    } catch (error) {
      setError("Server error");
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 700, 
        color: "primary.main",
        mb: 3
      }}>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="user management table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell component="th" scope="row">
                    {user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={user.isActive ? <CheckCircle /> : <Block />}
                      label={user.isActive ? "Active" : "Inactive"}
                      color={user.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<AdminPanelSettings />}
                      label={user.isAdmin ? "Admin" : "User"}
                      color={user.isAdmin ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.registeredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(user.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.isActive}
                      onChange={() => toggleUserStatus(user._id, user.isActive)}
                      color="success"
                    />
                    <Switch
                      checked={user.isAdmin}
                      onChange={() => toggleAdminStatus(user._id, user.isAdmin)}
                      color="primary"
                    />
                    <IconButton
                      color="error"
                      onClick={() => deleteUser(user._id)}
                    >
                      <Delete />
                    </IconButton>
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