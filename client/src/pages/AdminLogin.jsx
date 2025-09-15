import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  TextField,
  Button,
  Box,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Typography,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Email, AdminPanelSettings } from "@mui/icons-material";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    showPassword: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClickShowPassword = () => {
    setFormData({
      ...formData,
      showPassword: !formData.showPassword
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      nav("/admin/dashboard");
    } catch (e) {
      console.error("Admin login error:", e);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6e6fa 0%, #d8bfd8 50%, #b0c4de 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(128, 0, 128, 0.15) 0%, transparent 70%)",
          animation: "float 15s infinite ease-in-out",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 0, 255, 0.1) 0%, transparent 70%)",
          animation: "float 18s infinite ease-in-out reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        }
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: 3,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(75, 0, 130, 0.5)",
            color: "white",
            position: "relative",
            zIndex: 1,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(75, 0, 130, 0.4)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                background: "linear-gradient(135deg, #4b0082 0%, #000080 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                boxShadow: "0 0 20px rgba(75, 0, 130, 0.5)"
              }}
            >
              <AdminPanelSettings sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography component="h1" variant="h4" sx={{ 
              fontWeight: 700, 
              color: "white",
              mb: 1,
              textShadow: "0 0 10px rgba(75, 0, 130, 0.5)"
            }}>
              Admin Portal
            </Typography>
            <Typography variant="body2" sx={{ color: "#a0a0d0" }}>
              Sign in to access admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3, 
              backgroundColor: "rgba(211, 47, 47, 0.2)",
              color: "#ff8a8a",
              border: "1px solid rgba(211, 47, 47, 0.3)"
            }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#6a5acd" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "rgba(40, 40, 70, 0.7)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "#6a5acd",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9370db",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7b68ee",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#b0b0e0",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#7b68ee",
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={formData.showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#6a5acd" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: "#6a5acd" }}
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "rgba(40, 40, 70, 0.7)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "#6a5acd",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9370db",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7b68ee",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#b0b0e0",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#7b68ee",
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(90deg, #4b0082 0%, #000080 100%)",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 14px 0 rgba(75, 0, 130, 0.5)",
                "&:hover": {
                  background: "linear-gradient(90deg, #000080 0%, #4b0082 100%)",
                  boxShadow: "0 6px 20px 0 rgba(75, 0, 130, 0.7)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign In"
              )}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#b0b0e0" }}>
                Regular user?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#9370db",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  User Login
                </Link>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: "1px solid", 
            borderColor: "rgba(75, 0, 130, 0.3)" 
          }}>
            <Typography variant="caption" display="block" align="center" sx={{ color: "#b0b0e0" }}>
              <Link href="#" style={{ color: "#9370db", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" align="center" sx={{ color: "rgba(80, 80, 120, 0.8)" }}>
            © 2024 SyncSphere. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}