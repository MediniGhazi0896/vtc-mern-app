import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import API from "../services/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
} from "@mui/material";
import LogoNavbar from "../components/LogoNavbar";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/public/register", form); // ✅ call backend
      login(res.data.user);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <>
      <LogoNavbar />
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
            Create Your DriveLink Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign up to start booking safe and reliable rides
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Full Name"
              name="name"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={handleChange}
              required
            />
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
              helperText="At least 8 characters, incl. uppercase, number & special character"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3, borderRadius: 2 }}
            >
              Register
            </Button>
          </Box>

          {/* ✅ Link to login page */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login">
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default Register;
