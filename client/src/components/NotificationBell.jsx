import { useEffect, useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/notifications')
      .then(res => {
        const unread = res.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => console.error('Failed to load notifications'));
  }, []);

  return (
    <IconButton color="inherit" onClick={() => navigate('/dashboard/notifications')}>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;
