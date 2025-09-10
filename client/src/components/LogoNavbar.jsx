import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Box } from "@mui/material";
import logo from "../assets/drivelink-logo.png"; // ✅ your logo file

const LogoNavbar = () => {
  return (
    <AppBar position="fixed" color="transparent" elevation={0}>
      <Toolbar>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="DriveLink Logo"
            sx={{ height: 40, width: "auto" }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default LogoNavbar;
