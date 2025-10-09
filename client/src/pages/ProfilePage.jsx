import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  useTheme,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const cards = [
    {
      title: "Personal Info",
      icon: <PersonOutlineIcon sx={{ fontSize: 38 }} />,
      color: theme.palette.primary.main,
      path: "/dashboard/profile/info",
    },
    {
      title: "Security",
      icon: <SecurityOutlinedIcon sx={{ fontSize: 38 }} />,
      color: theme.palette.warning.main,
      path: "/dashboard/profile/security",
    },
    {
      title: "Privacy & Data",
      icon: <LockOutlinedIcon sx={{ fontSize: 38 }} />,
      color: theme.palette.success.main,
      path: "/dashboard/profile/privacy",
    },
  ];

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: theme.palette.grey[50],
        }}
      >
        <Avatar
          src={user?.avatarUrl || ""}
          sx={{
            width: 100,
            height: 100,
            mx: "auto",
            mb: 2,
            bgcolor: theme.palette.grey[300],
            fontSize: 40,
          }}
        >
          {!user?.avatarUrl && (user?.name?.[0]?.toUpperCase() || "U")}
        </Avatar>

        <Typography variant="h5" fontWeight={600}>
          {user?.name || "Guest User"}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {user?.email || "No email provided"}
        </Typography>
      </Box>

      {/* Navigation Cards */}
      <Grid container spacing={3} justifyContent="center">
        {cards.map((card) => {
          const isActive = location.pathname === card.path;
          return (
            <Grid key={card.title} item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  transition: "0.3s ease",
                  border: isActive
                    ? `2px solid ${card.color}`
                    : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: isActive
                    ? "0px 6px 16px rgba(0,0,0,0.15)"
                    : "0px 2px 8px rgba(0,0,0,0.1)",
                  transform: isActive ? "translateY(-3px)" : "none",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(card.path)}>
                  <CardContent>
                    <Stack
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="center"
                      sx={{ py: 3 }}
                    >
                      <Box
                        sx={{
                          color: isActive
                            ? card.color
                            : theme.palette.text.secondary,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        fontWeight={600}
                        sx={{
                          color: isActive
                            ? card.color
                            : theme.palette.text.primary,
                        }}
                      >
                        {card.title}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Suggestions Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Suggestions
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Complete your account checkup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your account checkup to make the app work better for you
              and keep your data secure.
            </Typography>
          </Box>

          <Box
            onClick={() => navigate("/profile/security")}
            sx={{
              mt: { xs: 2, md: 0 },
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Begin Checkup
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
};

export default ProfilePage;
