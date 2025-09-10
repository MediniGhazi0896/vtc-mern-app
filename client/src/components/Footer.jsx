import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
} from "@mui/icons-material";
import logo from "../assets/drivelink-logo.png";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "primary.main",
        color: "white",
        pt: 8,
        pb: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Logo + Tagline */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box
                component="img"
                src={logo}
                alt="DriveLink Logo"
                sx={{ height: 40, width: "auto" }}
              />
              <Typography variant="h6" fontWeight="bold">
                DriveLink
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 280 }}>
              Your trusted ride-hailing partner — quick, safe, and reliable.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {[
                { label: "Home", path: "/" },
                { label: "Login", path: "/login" },
                { label: "Help", path: "/dashboard/help" },
                { label: "Contact", path: "#contact" },
              ].map((link) => (
                <Link
                  key={link.label}
                  component={link.path.startsWith("#") ? "a" : RouterLink}
                  to={!link.path.startsWith("#") ? link.path : undefined}
                  href={link.path.startsWith("#") ? link.path : undefined}
                  color="inherit"
                  underline="hover"
                  sx={{
                    opacity: 0.9,
                    "&:hover": { opacity: 1, pl: 0.5 },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Features */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Features
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                ⚡ Quick Booking
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                🛡️ Safe & Secure
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                📞 24/7 Support
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Social Media + Copyright */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Social Media Icons */}
          <Stack direction="row" spacing={1}>
            <IconButton
              href="https://facebook.com"
              target="_blank"
              rel="noopener"
              sx={{ color: "white", "&:hover": { color: "#1877F2" } }}
            >
              <Facebook />
            </IconButton>
            <IconButton
              href="https://twitter.com"
              target="_blank"
              rel="noopener"
              sx={{ color: "white", "&:hover": { color: "#1DA1F2" } }}
            >
              <Twitter />
            </IconButton>
            <IconButton
              href="https://linkedin.com"
              target="_blank"
              rel="noopener"
              sx={{ color: "white", "&:hover": { color: "#0A66C2" } }}
            >
              <LinkedIn />
            </IconButton>
            <IconButton
              href="https://instagram.com"
              target="_blank"
              rel="noopener"
              sx={{ color: "white", "&:hover": { color: "#E4405F" } }}
            >
              <Instagram />
            </IconButton>
          </Stack>

          {/* Copyright */}
          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: "center" }}>
            © {new Date().getFullYear()} DriveLink. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
