// src/pages/ProfilePage.jsx
import { useAuth } from '../context/AuthContext';
import { Paper, Typography } from '@mui/material';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h6">User Profile</Typography>
      <Typography>Email: {user?.email}</Typography>
      <Typography>Name: {user?.name}</Typography>
    </Paper>
  );
};

export default ProfilePage;
