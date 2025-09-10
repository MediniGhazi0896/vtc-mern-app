// client/src/components/NotificationBell.jsx
import { useEffect, useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket'; // <-- Import your socket instance

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/notifications')
      .then(res => {
         setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      })
      .catch(() => console.error('Failed to load notifications'));
       // Listen for new notifications from socket.io
    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => socket.off('notification'); 
  }, []);
  const handleClick = (e) => setAnchorEl(e.currentTarget);

  const handleClose = async () => {
    setAnchorEl(null);
    try {
      await API.patch('/notifications/mark-all-read'); // ✅ mark in backend
      setUnreadCount(0);
    } catch (err) {
      console.error('❌ Failed to mark notifications as read', err);
    }
  };
  return (
    <IconButton color="inherit" onClick={() => navigate('/dashboard/notifications')}>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;
