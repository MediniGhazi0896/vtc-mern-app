// src/layouts/DashboardLayout.jsx
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItemIcon,
  ListItemText,
  AppBar,
  Typography,
  CssBaseline,
  IconButton,
  ListItemButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemAvatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Dashboard as DashboardIcon,
  LocalTaxi,
  Person,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as ProfileIcon,
  BookOnline as BookingsIcon,
  DriveEta as DriverIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import Logo from '../assets/drivelink-logo.png';
import SettingsPanel from '../components/SettingsPanel';
import HelpPanel from '../components/HelpPanel';

const drawerWidth = 240;

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const DashboardLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // avatar menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const toggleDrawer = () => setOpen((v) => !v);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard', roles: ['user', 'admin', 'driver'] },
    { text: 'My Bookings', icon: <LocalTaxi />, route: '/dashboard/bookings', roles: ['user'] },
    { text: 'Manage Bookings', icon: <LocalTaxi />, route: '/dashboard/bookings', roles: ['admin'] },
    /* { text: 'Profile', icon: <Person />, route: '/dashboard/profile', roles: ['user', 'admin', 'driver'] }, */
    /* { text: 'Admin Panel', icon: <AdminIcon />, route: '/dashboard/admin/users', roles: ['admin'] }, */
    { text: 'Driver Panel', icon: <DriverIcon />, route: '/dashboard/driver', roles: ['driver'] },
    /* { text: 'Notifications', icon: <NotificationsIcon />, route: '/dashboard/notifications', roles: ['user','admin','driver'] }, */
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ gap: 1 }}>
        <Box component="img" src={Logo} alt="DriveLink" sx={{ height: 32 }} />
        <Typography variant="h6" noWrap>DriveLink</Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems
          .filter((item) => !item.roles || item.roles.includes(user?.role))
          .map((item) => (
            <ListItemButton key={item.text} onClick={() => navigate(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}


      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
      <HelpPanel open={showHelp} onClose={() => setShowHelp(false)} />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: 'width 0.3s ease, margin 0.3s ease'
        }}
      >
        <Toolbar>
          {/* left: menu + welcome */}
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Welcome, {user?.name || 'User'}
          </Typography>

          {/* right: bell + avatar dropdown */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NotificationBell />
            <IconButton
              onClick={handleAvatarClick}
              size="small"
              sx={{ p: 0.5 }}
              aria-controls={menuOpen ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              {user?.profileImage ? (
                <Avatar
                  src={`http://localhost:5000/uploads/${user.profileImage}`}
                  alt={user?.name || 'Profile'}
                  sx={{ width: 36, height: 36 }}
                />
              ) : (
                <Avatar sx={{ width: 36, height: 36 }}>
                  {getInitials(user?.name) || <ProfileIcon fontSize="small" />}
                </Avatar>
              )}
            </IconButton>

            {/* dropdown */}
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: { mt: 1.5, minWidth: 220, borderRadius: 2 }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => navigate('/dashboard/profile')}>
                <ListItemAvatar><Avatar><ProfileIcon /></Avatar></ListItemAvatar>
                <ListItemText primary="My Profile" secondary={user?.email} />
              </MenuItem>

              {/* role-aware quick links */}
              {user?.role === 'user' && (
                <MenuItem onClick={() => navigate('/dashboard/bookings')}>
                  <ListItemIcon><BookingsIcon fontSize="small" /></ListItemIcon>
                  My Bookings
                </MenuItem>
              )}
              {user?.role === 'driver' && (
                <MenuItem onClick={() => navigate('/dashboard/driver')}>
                  <ListItemIcon><DriverIcon fontSize="small" /></ListItemIcon>
                  Driver Panel
                </MenuItem>
              )}
              {user?.role === 'admin' && (
                <MenuItem onClick={() => navigate('/dashboard/admin/users')}>
                  <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                  Admin Panel
                </MenuItem>
              )}

              <Divider sx={{ my: 1 }} />

              <MenuItem onClick={() => setShowSettings(true)}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={() => setShowHelp(true)}>
                <ListItemIcon><HelpIcon fontSize="small" /></ListItemIcon>
                Help & Support
              </MenuItem>
              <Divider sx={{ my: 1 }} />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: 'width 0.3s ease'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
