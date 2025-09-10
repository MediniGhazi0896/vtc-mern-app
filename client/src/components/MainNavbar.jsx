import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Stack,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/drivelink-logo.png";
import { Link as RouterLink } from "react-router-dom";

const MainNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [aboutAnchor, setAboutAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAboutOpen = (event) => setAboutAnchor(event.currentTarget);
  const handleAboutClose = () => setAboutAnchor(null);

  const mainLinks = [
    { label: "Ride", path: "/" },
    { label: "Drive", path: "/drive" },
    { label: "Business", path: "/business" },
    { label: "About", dropdown: true },
  ];

  const rightLinks = [
    { label: "EN", path: "#" },
    { label: "Help", path: "/help" },
    { label: "Login", path: "/login" },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "primary.main", color: "white" }}
      elevation={1}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* ✅ Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            gap: 1,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="DriveLink Logo"
            sx={{ height: 32 }}
          />
          <Typography variant="h6" fontWeight="bold">
            DriveLink
          </Typography>
        </Box>

        {/* ✅ Desktop Menu */}
        {!isMobile && (
          <Stack direction="row" spacing={3} alignItems="center">
            {mainLinks.map((link) =>
              link.dropdown ? (
                <Box key={link.label}>
                  <Button
                    onClick={handleAboutOpen}
                    sx={{
                      fontWeight: "600",
                      color: "white",
                      "&:hover": {
                        borderBottom: "2px solid white",
                        borderRadius: 0,
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                  <Menu
                    anchorEl={aboutAnchor}
                    open={Boolean(aboutAnchor)}
                    onClose={handleAboutClose}
                    PaperProps={{
                      sx: { mt: 1, minWidth: 200 },
                    }}
                  >
                    <MenuItem onClick={handleAboutClose}>About Us</MenuItem>
                    <MenuItem onClick={handleAboutClose}>
                      Our Offerings
                    </MenuItem>
                    <MenuItem onClick={handleAboutClose}>
                      How DriveLink Works
                    </MenuItem>
                    <MenuItem onClick={handleAboutClose}>
                      Sustainability
                    </MenuItem>
                    <MenuItem onClick={handleAboutClose}>Careers</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    fontWeight: "600",
                    color: "white",
                    "&:hover": {
                      borderBottom: "2px solid white",
                      borderRadius: 0,
                    },
                  }}
                >
                  {link.label}
                </Button>
              )
            )}
          </Stack>
        )}

        {/* ✅ Right-side actions */}
        {!isMobile && (
          <Stack direction="row" spacing={2} alignItems="center">
            {rightLinks.map((link) => (
              <Button
                key={link.label}
                component={RouterLink}
                to={link.path}
                sx={{
                  color: "white",
                  "&:hover": {
                    borderBottom: "2px solid white",
                    borderRadius: 0,
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
            <Button
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/register"
              sx={{
                borderRadius: 20,
                px: 3,
                fontWeight: "600",
                color: "white",
                "&:hover": {
                  backgroundColor: theme.palette.secondary.dark,
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        )}

        {/* ✅ Mobile Hamburger */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* ✅ Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {mainLinks.map((link) =>
              link.dropdown ? (
                <React.Fragment key={link.label}>
                  <ListItem>
                    <ListItemText primary={link.label} />
                  </ListItem>
                  <List sx={{ pl: 2 }}>
                    <ListItem button>
                      <ListItemText primary="About Us" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Our Offerings" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="How DriveLink Works" />
                    </ListItem>
                  </List>
                </React.Fragment>
              ) : (
                <ListItem
                  button
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={link.label} />
                </ListItem>
              )
            )}

            {rightLinks.map((link) => (
              <ListItem
                button
                key={link.label}
                component={RouterLink}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}

            <ListItem
              button
              component={RouterLink}
              to="/register"
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary="Sign Up" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default MainNavbar;
