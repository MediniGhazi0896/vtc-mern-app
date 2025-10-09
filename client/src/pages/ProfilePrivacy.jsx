import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Stack,
  Divider,
  Button,
} from "@mui/material";

const ProfilePrivacy = () => {
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareData: false,
    emailUpdates: true,
  });

  const handleToggle = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // TODO: Connect with /api/users/privacy
    console.log("Privacy settings saved:", privacy);
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Privacy & Data Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage how your data is shared and displayed across the platform.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2} sx={{ maxWidth: 500 }}>
        <FormControlLabel
          control={
            <Switch
              checked={privacy.showProfile}
              onChange={() => handleToggle("showProfile")}
            />
          }
          label="Show my profile publicly"
        />
        <FormControlLabel
          control={
            <Switch
              checked={privacy.shareData}
              onChange={() => handleToggle("shareData")}
            />
          }
          label="Allow data sharing with partners"
        />
        <FormControlLabel
          control={
            <Switch
              checked={privacy.emailUpdates}
              onChange={() => handleToggle("emailUpdates")}
            />
          }
          label="Receive email updates"
        />

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSave}>
            Save Preferences
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProfilePrivacy;
