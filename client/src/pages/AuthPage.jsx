// client/src/pages/AuthPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import LogoNavbar from "../components/LogoNavbar";
import PasswordField from "../components/PasswordField";

const AuthPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "+49",
    email: "",
    password: "",
    role: "traveller",
    vehicle: { make: "", model: "", color: "", plate: "", seats: 4 },
    driverLicense: "",
  });

  const [isLogin, setIsLogin] = useState(true);
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get("redirect") || "/";

  useEffect(() => {
    if (location.pathname === "/register") setIsLogin(false);
    else setIsLogin(true);
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser && !user) {
      const parsedUser = JSON.parse(storedUser);
      login(parsedUser);

      if (parsedUser.role === "driver") navigate("/dashboard");
      else if (parsedUser.role === "traveller")
        navigate(redirectPath !== "/" ? redirectPath : "/dashboard/bookings/new");
      else navigate("/");
    }
  }, [user, login, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    const payload = isLogin
      ? { email: form.email, password: form.password }
      : {
          ...form,
          phone: `${form.countryCode}${form.phone}`,
        };

    try {
      const res = await API.post(endpoint, payload);
      login(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      if (res.data.user.role === "driver") navigate("/dashboard", { replace: true });
      else if (res.data.user.role === "traveller")
        navigate(
          redirectPath !== "/" ? redirectPath : "/dashboard/bookings/new",
          { replace: true }
        );
      else navigate("/", { replace: true });
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Auth failed");
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setForm({
      name: "",
      phone: "",
      countryCode: "+49",
      email: "",
      password: "",
      role: "traveller",
      vehicle: { make: "", model: "", color: "", plate: "", seats: 4 },
      driverLicense: "",
    });
  };

  return (
    <>
      <LogoNavbar />
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
          <Paper sx={{ padding: 4, width: "100%", borderRadius: 3 }}>
            <Typography variant="h5" align="center" gutterBottom>
              {isLogin ? "Login" : "Sign Up"}
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <PasswordField
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              {!isLogin && (
                <>
                  <TextField
                    label="Full Name"
                    name="name"
                    fullWidth
                    margin="normal"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <FormControl sx={{ minWidth: 100 }}>
                      <InputLabel id="country-code-label">Code</InputLabel>
                      <Select
                        labelId="country-code-label"
                        value={form.countryCode}
                        label="Code"
                        onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                        required
                      >
                        <MenuItem value="+49">+49 (Germany)</MenuItem>
                        <MenuItem value="+216">+216 (Tunisia)</MenuItem>
                        <MenuItem value="+33">+33 (France)</MenuItem>
                        <MenuItem value="+1">+1 (USA)</MenuItem>
                        <MenuItem value="+44">+44 (UK)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      fullWidth
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </Box>

                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    I am a:
                  </Typography>

                  <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={form.role}
                    onChange={(e, newRole) => {
                      if (newRole) setForm({ ...form, role: newRole });
                    }}
                    fullWidth
                  >
                    <ToggleButton value="traveller">Traveller</ToggleButton>
                    <ToggleButton value="driver">Driver</ToggleButton>
                  </ToggleButtonGroup>

                  {/* ✅ Driver-only fields */}
                  {form.role === "driver" && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Vehicle Information
                      </Typography>

                      <TextField
                        label="Make"
                        fullWidth
                        margin="normal"
                        value={form.vehicle.make}
                        onChange={(e) =>
                          setForm({ ...form, vehicle: { ...form.vehicle, make: e.target.value } })
                        }
                      />
                      <TextField
                        label="Model"
                        fullWidth
                        margin="normal"
                        value={form.vehicle.model}
                        onChange={(e) =>
                          setForm({ ...form, vehicle: { ...form.vehicle, model: e.target.value } })
                        }
                      />
                      <TextField
                        label="Color"
                        fullWidth
                        margin="normal"
                        value={form.vehicle.color}
                        onChange={(e) =>
                          setForm({ ...form, vehicle: { ...form.vehicle, color: e.target.value } })
                        }
                      />
                      <TextField
                        label="Plate Number"
                        fullWidth
                        margin="normal"
                        value={form.vehicle.plate}
                        onChange={(e) =>
                          setForm({ ...form, vehicle: { ...form.vehicle, plate: e.target.value } })
                        }
                      />
                      <TextField
                        label="Seats"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={form.vehicle.seats}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            vehicle: { ...form.vehicle, seats: parseInt(e.target.value) || 4 },
                          })
                        }
                      />
                      <TextField
                        label="Driver License Number"
                        fullWidth
                        margin="normal"
                        value={form.driverLicense}
                        onChange={(e) => setForm({ ...form, driverLicense: e.target.value })}
                      />
                    </Box>
                  )}
                </>
              )}

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, borderRadius: 2 }}>
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
