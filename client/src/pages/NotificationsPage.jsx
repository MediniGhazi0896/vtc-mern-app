import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import API from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  const fetch = () => {
    API.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => alert('Failed to load notifications'));
  };

  const markAsRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    fetch();
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>🔔 Notifications</Typography>
      <List>
        {notifications.map((n) => (
          <ListItem
            key={n._id}
            sx={{ bgcolor: n.isRead ? '#f5f5f5' : '#e3f2fd', mb: 1, borderRadius: 1 }}
            secondaryAction={
              !n.isRead && (
                <Button onClick={() => markAsRead(n._id)} size="small">
                  Mark as Read
                </Button>
              )
            }
          >
            <ListItemText
              primary={n.title}
              secondary={n.message + ' — ' + new Date(n.createdAt).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default NotificationsPage;
