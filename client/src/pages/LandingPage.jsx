import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MainNavbar />

      {/* ✅ Hero Section */}
      {!user ? (
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            textAlign: "center",
            py: 12,
            px: 2,
            mt: 8,
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant={isMobile ? "h4" : "h2"}
              fontWeight="bold"
              gutterBottom
            >
              Welcome to DriveLink
            </Typography>
            <Typography variant="h6" sx={{ mb: 4 }}>
              Your trusted ride-hailing partner — quick, safe, and reliable.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                // 🔥 send user to login with redirect param
                to="/login?redirect=/dashboard/bookings/new"
              >
                Book a Ride
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.contrastText,
                }}
                size="large"
                component={RouterLink}
                to="/login"
              >
                Sign In
              </Button>
            </Box>
          </Container>
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            textAlign: "center",
            py: 10,
            px: 2,
            mt: 8,
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant={isMobile ? "h5" : "h3"}
              fontWeight="bold"
              gutterBottom
            >
              Welcome back, {user.name?.split(" ")[0]} 👋
            </Typography>
            <Typography variant="h6" sx={{ mb: 4 }}>
              {user.role === "driver"
                ? "Ready to start driving today?"
                : "Ready to book your next ride?"}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              {user.role === "driver" ? (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/dashboard"
                >
                  Go Online
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/dashboard/bookings/new"
                >
                  Book a Ride
                </Button>
              )}
            </Box>
          </Container>
        </Box>
      )}

      {/* ✅ Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} textAlign="center">
          {[
            {
              title: "Quick Booking",
              desc: "Book your ride in just a few taps, anytime.",
              icon: "⚡",
            },
            {
              title: "Safe & Secure",
              desc: "Verified drivers and safe routes, every time.",
              icon: "🛡️",
            },
            {
              title: "24/7 Support",
              desc: "DriveLink is always here to assist you.",
              icon: "📞",
            },
            {
              title: "Affordable",
              desc: "Competitive pricing with transparent fares.",
              icon: "💶",
            },
          ].map((f, i) => (
            <Grid
              item
              xs={12}
              md={4}
              key={i}
              sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <Box sx={{ fontSize: "3rem", lineHeight: 1, mb: 1 }}>{f.icon}</Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {f.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {f.desc}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default LandingPage;
