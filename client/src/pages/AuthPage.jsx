import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Container,
} from "@mui/material";
import LogoNavbar from "../components/LogoNavbar";
import PasswordField from "../components/PasswordField";

const AuthPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser && !user) {
      login(JSON.parse(storedUser)); // update context
      navigate("/dashboard");
    }
  }, [user, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin
      ? "/public/login"
      : "/public/register"; // ✅ backend public routes
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await API.post(endpoint, payload);
      login(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Auth failed");
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <>
      <LogoNavbar /> {/* ✅ Always show logo nav */}
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 12,
          }}
        >
          <Paper sx={{ padding: 4, width: "100%", borderRadius: 3 }}>
            <Typography variant="h5" align="center" gutterBottom>
              {isLogin ? "Login" : "Sign Up"}
            </Typography>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              )}
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
              <PasswordField
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2, borderRadius: 2 }}
              >
                {isLogin ? "Login" : "Register"}
              </Button>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
              <Link sx={{ cursor: "pointer" }} onClick={handleToggle}>
                {isLogin ? "Sign Up" : "Login"}
              </Link>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default AuthPage;
