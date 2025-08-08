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
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Dashboard as DashboardIcon,
  LocalTaxi,
  Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard', roles: ['user', 'admin', 'driver'] },
  { text: 'My Bookings', icon: <LocalTaxi />, route: '/dashboard/bookings', roles: ['user'] },
  { text: 'Manage Bookings', icon: <LocalTaxi />, route: '/dashboard/bookings', roles: ['admin'] },
  { text: 'Profile', icon: <Person />, route: '/dashboard/profile', roles: ['user', 'admin', 'driver'] },
  { text: 'Admin Panel', icon: <Person />, route: '/dashboard/admin/users', roles: ['admin'] },
  { text: 'Driver Panel', icon: <LocalTaxi />, route: '/dashboard/driver', roles: ['driver'] },
];


  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          VTC Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
  {menuItems
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => (
      <ListItemButton key={item.text} onClick={() => navigate(item.route)}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItemButton>
    ))}

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar with Toggle Button */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: 'width 0.3s ease, margin 0.3s ease'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Welcome, {user?.name || 'User'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
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
