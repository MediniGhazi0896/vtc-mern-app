import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  MenuItem,
  IconButton,
  Stack,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Fade,
  Menu,
  Divider,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LocalTaxiOutlinedIcon from "@mui/icons-material/LocalTaxiOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../assets/drivelink-logo.png";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ✅ Floating Menu with blur, shadow, and NO scroll lock
const FloatingMenu = (props) => (
  <Menu
    elevation={8}
    TransitionComponent={Fade}
    keepMounted
    disableScrollLock
    PaperProps={{
      sx: {
        borderRadius: 3,
        mt: 1,
        width: 320,
        maxWidth: "92vw",
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255,255,255,0.95)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
        p: 2,
      },
    }}
    {...props}
  />
);

const MainNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [aboutAnchor, setAboutAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleAboutOpen = (event) => setAboutAnchor(event.currentTarget);
  const handleAboutClose = () => setAboutAnchor(null);

  const handleProfileOpen = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const displayName = useMemo(() => {
    if (!user?.name) return "Guest";
    return user.name;
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout?.();
    } finally {
      handleProfileClose();
      navigate("/");
    }
  };

  const mainLinks = [
    { label: "Ride", path: "/" },
    { label: "Drive", path: "/drive" },
    { label: "Business", path: "/business" },
    { label: "About", dropdown: true },
  ];

  const rightLinks = [
    { label: "EN", path: "#" },
    { label: "Help", path: "/help" },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "primary.main", color: "white", height: 64 }}
      elevation={1}
    >
      <Toolbar
        sx={{ justifyContent: "space-between", minHeight: "64px !important" }}
      >
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
          <Box component="img" src={logo} alt="DriveLink Logo" sx={{ height: 32 }} />
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
                      position: "relative",
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        width: "0%",
                        height: "2px",
                        bottom: -4,
                        left: 0,
                        backgroundColor: "white",
                        transition: "width 0.3s ease",
                      },
                      "&:hover:after": {
                        width: "100%",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                  <FloatingMenu
                    anchorEl={aboutAnchor}
                    open={Boolean(aboutAnchor)}
                    onClose={handleAboutClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                  >
                    <MenuItem onClick={handleAboutClose}>About Us</MenuItem>
                    <MenuItem onClick={handleAboutClose}>Our Offerings</MenuItem>
                    <MenuItem onClick={handleAboutClose}>How DriveLink Works</MenuItem>
                    <MenuItem onClick={handleAboutClose}>Sustainability</MenuItem>
                    <MenuItem onClick={handleAboutClose}>Careers</MenuItem>
                  </FloatingMenu>
                </Box>
              ) : (
                <Button
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    fontWeight: "600",
                    color: "white",
                    position: "relative",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      width: "0%",
                      height: "2px",
                      bottom: -4,
                      left: 0,
                      backgroundColor: "white",
                      transition: "width 0.3s ease",
                    },
                    "&:hover:after": {
                      width: "100%",
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
                sx={{ color: "white" }}
              >
                {link.label}
              </Button>
            ))}

            {!user ? (
              <>
                <Button component={RouterLink} to="/login" sx={{ color: "white" }}>
                  Login
                </Button>
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
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {/* ✅ Profile Avatar */}
                <IconButton onClick={handleProfileOpen} sx={{ p: 0 }}>
                  <Avatar
                    src={user.profileImage || ""}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 36,
                      height: 36,
                    }}
                  >
                    {!user.profileImage && user.name
                      ? user.name[0].toUpperCase()
                      : ""}
                  </Avatar>
                </IconButton>

                {/* ✅ Enhanced Profile Menu */}
                <FloatingMenu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {displayName}
                      </Typography>
                    </Box>
                    <Avatar src={user.profileImage || ""} />
                  </Box>

                  {/* Shortcuts */}
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          navigate("/bookings");
                          handleProfileClose();
                        }}
                      >
                        <LocalTaxiOutlinedIcon />
                      </Button>
                      <Typography variant="caption">Bookings</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          navigate("/payments");
                          handleProfileClose();
                        }}
                      >
                        <PaymentsOutlinedIcon />
                      </Button>
                      <Typography variant="caption">Payments</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          navigate("/notifications");
                          handleProfileClose();
                        }}
                      >
                        <NotificationsNoneOutlinedIcon />
                      </Button>
                      <Typography variant="caption">Alerts</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Main links */}
                  <MenuItem
                    onClick={() => {
                      navigate("/dashboard");
                      handleProfileClose();
                    }}
                  >
                    <ManageAccountsOutlinedIcon sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/rides");
                      handleProfileClose();
                    }}
                  >
                    <HistoryOutlinedIcon sx={{ mr: 1 }} /> Ride History
                  </MenuItem>

                  {user.role === "driver" && (
                    <MenuItem
                      onClick={() => {
                        navigate("/dashboard/driver");
                        handleProfileClose();
                      }}
                    >
                      <DashboardOutlinedIcon sx={{ mr: 1 }} /> Driver Panel
                    </MenuItem>
                  )}

                  {user.role === "admin" && (
                    <>
                      <MenuItem
                        onClick={() => {
                          navigate("/dashboard/admin/users");
                          handleProfileClose();
                        }}
                      >
                        <DashboardOutlinedIcon sx={{ mr: 1 }} /> Admin Dashboard
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          navigate("/analytics");
                          handleProfileClose();
                        }}
                      >
                        <InsightsOutlinedIcon sx={{ mr: 1 }} /> Analytics
                      </MenuItem>
                    </>
                  )}

                  {/* Logout */}
                  <Divider sx={{ my: 1.5 }} />
                  <Button
                    onClick={handleSignOut}
                    fullWidth
                    startIcon={<LogoutIcon />}
                    color="error"
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    Sign out
                  </Button>
                </FloatingMenu>
              </>
            )}
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

            {!user ? (
              <>
                <ListItem
                  button
                  component={RouterLink}
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem
                  button
                  component={RouterLink}
                  to="/register"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary="Sign Up" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem
                  button
                  onClick={() => {
                    navigate("/dashboard");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    navigate("/rides");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Ride History" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    logout();
                    navigate("/");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default MainNavbar;
