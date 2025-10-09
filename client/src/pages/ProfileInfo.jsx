import React from "react";
import { Paper, Typography, Box, TextField, Button, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const ProfileInfo = () => {
  const { user } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Connect with your API endpoint PUT /api/users/me
    console.log("Profile info updated");
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Personal Information
      </Typography>

      <Box component="form" onSubmit={handleSave}>
        <Stack spacing={3} sx={{ maxWidth: 500 }}>
          <TextField
            label="Full Name"
            defaultValue={user?.name || ""}
            fullWidth
          />
          <TextField
            label="Email"
            defaultValue={user?.email || ""}
            type="email"
            fullWidth
          />
          <TextField
            label="Phone Number"
            defaultValue={user?.phone || ""}
            fullWidth
          />
          <Button variant="contained" type="submit" sx={{ width: "fit-content" }}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ProfileInfo;
