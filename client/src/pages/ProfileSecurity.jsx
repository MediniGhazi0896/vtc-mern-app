import React from "react";
import {
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  Divider,
} from "@mui/material";

const ProfileSecurity = () => {
  const handlePasswordChange = (e) => {
    e.preventDefault();
    // TODO: Connect with /api/users/change-password
    console.log("Password updated");
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Security Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Update your password and manage your account's security settings.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handlePasswordChange}>
        <Stack spacing={3} sx={{ maxWidth: 500 }}>
          <TextField label="Current Password" type="password" required />
          <TextField label="New Password" type="password" required />
          <TextField label="Confirm New Password" type="password" required />

          <Button variant="contained" type="submit" sx={{ width: "fit-content" }}>
            Update Password
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ProfileSecurity;
