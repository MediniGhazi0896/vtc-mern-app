// client/src/pages/DriverDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Chip, CircularProgress, Box, Button, Switch, FormControlLabel,
} from "@mui/material";
import API from "../services/api";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

const DriverDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [assignedBookings, setAssignedBookings] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(user?.isAvailable || false);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      socket.emit("registerDriver", user.id); // ✅ register this driver’s personal room
    });

    socket.on("ride:new", (ride) => {
      console.log("📡 Received event: ride:new", ride);
      if (ride.status === "pending" && available) {
        toast.success(`🚗 New ride: ${ride.pickupLocation} → ${ride.destination}`);
        setAvailableBookings((prev) => [ride, ...prev]);
        audioRef.current?.play().catch(() => {});
      }
    });

    socket.on("ride:update", (updatedRide) => {
      console.log("🔄 Ride update event:", updatedRide);
      if (updatedRide.assignedDriver?._id === user.id) {
        fetchAssignedBookings();
      }
      setAvailableBookings((prev) =>
        prev.filter((b) => b._id !== updatedRide._id)
      );
    });

    return () => socket.disconnect();
  }, [user, available]);

  useEffect(() => {
    if (user?.role !== "driver") navigate("/dashboard");
    else {
      fetchAssignedBookings();
      fetchAvailableBookings();
    }
  }, [user]);

  const fetchAssignedBookings = async () => {
    try {
      const res = await API.get("/bookings/driver");
      setAssignedBookings(res.data);
    } catch (err) {
      console.error("❌ Failed to load assigned bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const res = await API.get("/bookings");
      const open = res.data.filter(
        (b) => b.status === "pending" && !b.assignedDriver
      );
      setAvailableBookings(open);
    } catch (err) {
      console.error("❌ Failed to load available bookings:", err);
    }
  };

  const acceptRide = async (id) => {
    try {
      const res = await API.post(`/bookings/${id}/accept`);
      setAssignedBookings((prev) => [res.data.booking, ...prev]);
      setAvailableBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Failed to accept ride");
    }
  };

  const rejectRide = async (id) => {
    try {
      await API.post(`/bookings/${id}/reject`);
      setAvailableBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Failed to reject ride");
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await API.patch("/users/driver/availability");
      setAvailable(res.data.isAvailable);
      const updatedUser = { ...user, isAvailable: res.data.isAvailable };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(res.data.isAvailable ? "🟢 You’re now available" : "🔴 You’re now unavailable");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update availability");
    }
  };

  const getStatusChip = (status) => {
    const colorMap = { confirmed: "info", cancelled: "error", pending: "warning", completed: "success" };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colorMap[status?.toLowerCase()] || "default"}
        size="small"
      />
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Toaster position="top-right" />
      <audio ref={audioRef} src="/sounds/ride-alert.mp3" preload="auto" />

      <Typography variant="h5">🚗 Driver Dashboard</Typography>
      <Typography sx={{ mb: 1 }}>Welcome, <strong>{user?.name}</strong></Typography>

      <FormControlLabel
        control={<Switch checked={available} onChange={toggleAvailability} color="success" />}
        label={available ? "🟢 Available" : "🔴 Unavailable"}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Available Rides</Typography>
          {!available ? (
            <Typography>Toggle “Available” to receive new rides.</Typography>
          ) : availableBookings.length === 0 ? (
            <Typography>No rides available right now.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pickup</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableBookings.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b.pickupLocation}</TableCell>
                    <TableCell>{b.destination}</TableCell>
                    <TableCell>{b.userId?.name || "—"}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" color="success" sx={{ mr: 1 }} onClick={() => acceptRide(b._id)}>Accept</Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => rejectRide(b._id)}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>My Assigned Rides</Typography>
          {assignedBookings.length === 0 ? (
            <Typography>No assigned bookings yet.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pickup</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignedBookings.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b.pickupLocation}</TableCell>
                    <TableCell>{b.destination}</TableCell>
                    <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{getStatusChip(b.status)}</TableCell>
                    <TableCell>{b.userId?.name || "—"}</TableCell>
                    <TableCell>
                      {b.status === "confirmed" && (
                        <Button variant="contained" size="small" color="primary" onClick={() => updateStatus(b._id, "completed")}>Complete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </Paper>
  );
};

export default DriverDashboard;
