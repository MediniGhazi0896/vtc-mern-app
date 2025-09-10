import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MainNavbar from "../components/MainNavbar"; // ✅ use the new Uber-style navbar
import Footer from "../components/Footer"; // ✅ your new footer

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ✅ Uber-style navbar */}
      <MainNavbar />

      {/* ✅ Hero Section */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          textAlign: "center",
          py: 12,
          px: 2,
          mt: 8, // offset for fixed navbar
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
              to="/dashboard/bookings"
            >
              Book a Ride
            </Button>
            <Button
              variant="outlined"
              sx={{ color: "white", borderColor: "white" }}
              size="large"
              component={RouterLink}
              to="/login"
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

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

      {/* ✅ How It Works Section */}
      <Box sx={{ backgroundColor: "#f5f5f5", py: 10 }}>
        <Container maxWidth="lg" textAlign="center">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            How DriveLink Works
          </Typography>
          <Grid container spacing={6} justifyContent="center">
            {[
              { step: "Request your ride", icon: "📱" },
              { step: "Get matched instantly", icon: "🤝" },
              { step: "Enjoy the journey", icon: "🚗" },
              { step: "Pay with ease", icon: "💳" },
            ].map((s, i) => (
              <Grid
                item
                xs={6}
                md={3}
                key={i}
                sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <Box sx={{ fontSize: "3rem", lineHeight: 1, mb: 1 }}>{s.icon}</Box>
                <Typography variant="subtitle1">{s.step}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ✅ Contact Section */}
      <Box id="contact" sx={{ py: 10, textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Contact DriveLink
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Have questions? Reach out to our support team anytime.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            href="mailto:support@drivelink.com"
          >
            Email Support
          </Button>
        </Container>
      </Box>

      {/* ✅ Footer */}
      <Footer />
    </Box>
  );
};

export default LandingPage;
