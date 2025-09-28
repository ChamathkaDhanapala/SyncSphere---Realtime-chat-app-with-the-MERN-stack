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
import { Visibility, VisibilityOff, Lock, Person, Email, Message } from "@mui/icons-material";

export default function Register() {
  const nav = useNavigate();
  const { register, loading, error, setError } = useAuth(); 
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    showPassword: false
  });
  const [localError, setLocalError] = useState(""); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (error) setError("");
    if (localError) setLocalError("");
  };

  const handleClickShowPassword = () => {
    setFormData({
      ...formData,
      showPassword: !formData.showPassword
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (setError) setError("");
    setLocalError("");
    
    if (!formData.username || !formData.email || !formData.password) {
      const errorMsg = "All fields are required";
      if (setError) setError(errorMsg);
      else setLocalError(errorMsg);
      return;
    }
    
    if (formData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters";
      if (setError) setError(errorMsg);
      else setLocalError(errorMsg);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const errorMsg = "Please enter a valid email address";
      if (setError) setError(errorMsg);
      else setLocalError(errorMsg);
      return;
    }
    
    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result && result.success) {
        nav("/");
      }
    } catch (e) {
      console.error("Registration error:", e);
      const errorMsg = "Registration failed. Please try again.";
      if (setError) setError(errorMsg);
      else setLocalError(errorMsg);
    }
  };

  const displayError = error || localError;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
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
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
          animation: "float 18s infinite ease-in-out reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        }
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          sx={{
            p: 3,
            background: "rgba(30, 41, 59, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            position: "relative",
            zIndex: 1,
            boxShadow: 
              "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(59, 130, 246, 0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 
                "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)",
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                boxShadow: 
                  "0 8px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                animation: "iconFloat 3s ease-in-out infinite",
                "@keyframes iconFloat": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-5px)" },
                }
              }}
            >
              <Message sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Typography component="h1" variant="h5" sx={{ 
              fontWeight: 700, 
              background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
            }}>
              Join SyncSphere
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
              Create your account to start chatting
            </Typography>
          </Box>

          {displayError && (
            <Alert severity="error" sx={{ 
              mb: 2, 
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              color: "#fca5a5",
              fontSize: "0.9rem",
              py: 0.5
            }}>
              {displayError}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(59, 130, 246, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(59, 130, 246, 0.6)",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3b82f6",
                },
                "& .MuiOutlinedInput-input": {
                  color: "white",
                  fontSize: "0.9rem",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                  }
                }
              }}
            />
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
                    <Email sx={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(59, 130, 246, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(59, 130, 246, 0.6)",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3b82f6",
                },
                "& .MuiOutlinedInput-input": {
                  color: "white",
                  fontSize: "0.9rem",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                  }
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
                    <Lock sx={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: "#60a5fa" }}
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(59, 130, 246, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(59, 130, 246, 0.6)",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3b82f6",
                },
                "& .MuiOutlinedInput-input": {
                  color: "white",
                  fontSize: "0.9rem",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                  }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 1.5,
                py: 1,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 
                  "0 4px 12px rgba(59, 130, 246, 0.4)",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  boxShadow: 
                    "0 6px 20px rgba(59, 130, 246, 0.6)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  transition: "left 0.5s",
                },
                "&:hover::before": {
                  left: "100%",
                }
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Create Account"
              )}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#60a5fa",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            mt: 2, 
            pt: 1.5, 
            borderTop: "1px solid rgba(255, 255, 255, 0.1)", 
          }}>
            <Typography variant="caption" display="block" align="center" sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>
              By creating an account, you agree to our{" "}
              <Link href="#" style={{ 
                color: "#60a5fa", 
                textDecoration: "none",
                fontWeight: 600,
              }}>
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" style={{ 
                color: "#60a5fa", 
                textDecoration: "none",
                fontWeight: 600,
              }}>
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" align="center" sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.75rem" }}>
            © 2024 SyncSphere. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}