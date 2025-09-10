// client/src/pages/Login.jsx
import React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import LogoNavbar from "../components/LogoNavbar";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.user);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <>
      <LogoNavbar /> {/* ✅ only logo navbar */}
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            mt: 12,
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Sign in to DriveLink
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your email and password to access your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3, borderRadius: 2 }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Login;
