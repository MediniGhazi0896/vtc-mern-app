import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  CircularProgress
} from '@mui/material';
import API from '../services/api';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await API.put('/users/profile-picture', formData);
      setUser({ ...user, profileImage: res.data.imagePath });
    } catch {
      alert('❌ Failed to upload');
    } finally {
      setUploading(false);
    }
  };
console.log('🔍 profileImage:', user?.profileImage);
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">👤 User Profile</Typography>
      <Typography>Email: {user?.email}</Typography>
      <Typography>Name: {user?.name}</Typography>

      <Box mt={2}>
        <Avatar
  src={
    user?.profileImage
      ? `http://localhost:5000${user.profileImage}`
      : undefined
  }
  sx={{ width: 100, height: 100, mb: 1 }}
>
  {user?.name?.charAt(0).toUpperCase()}
  
</Avatar>
        <label htmlFor="profile-image-upload">
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />
          <Button variant="outlined" component="span" disabled={uploading}>
            {uploading ? <CircularProgress size={20} /> : 'Upload Picture'}
          </Button>
        </label>
      </Box>
    </Paper>
  );
};

export default ProfilePage;
