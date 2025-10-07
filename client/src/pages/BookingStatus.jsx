import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  requested: "warning",
  broadcasting: "info",
  pending: "warning",
  driver_accepted: "info",
  confirmed: "success",
  enroute: "info",
  arrived: "secondary",
  in_ride: "primary",
  completed: "success",
  cancelled: "default",
  expired: "error",
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function BookingStatus() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);

  const statusColor = useMemo(
    () => STATUS_COLORS[booking?.status] || "default",
    [booking?.status]
  );

  // --- Fetch current booking once ---
  const fetchBooking = async () => {
    try {
      const res = await API.get(`/bookings/${bookingId}`);
      setBooking(res.data.booking || res.data);
      if (res.data?.driver) setDriver(res.data.driver);
    } catch (err) {
      console.error("❌ Fetch booking failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    try {
      await API.patch(`/bookings/${bookingId}/status`, { status: "cancelled" });
      setBooking((b) => ({ ...b, status: "cancelled" }));
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      alert(err?.response?.data?.message || "Failed to cancel ride");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🟢 SOCKET CONNECTION + LISTENERS                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const s = io(BASE_URL, { auth: { token } });

    s.on("connect", () => {
      setSocketConnected(true);
      console.log("✅ Connected to socket:", s.id);
    });

    s.on("disconnect", () => setSocketConnected(false));

    // ✅ unified update listener
    s.on("ride:update", (payload) => {
      console.log("📡 Received ride:update:", payload);

      // some emitters send full booking, some send bookingId
      const updated = payload.booking || payload;
      if (!updated?._id || updated._id !== bookingId) return;

      setBooking(updated);
      if (payload.driver || updated.assignedDriver) {
        setDriver(payload.driver || updated.assignedDriver);
      }
    });

    // ✅ backward compatible listener (legacy event format)
    s.on(`ride:update:${bookingId}`, (payload) => {
      console.log("📡 Received ride:update:<id>:", payload);
      if (!payload) return;
      setBooking((prev) => ({ ...prev, ...payload }));
      if (payload.driver) setDriver(payload.driver);
    });

    // ✅ fallback: simple status updates
    s.on("booking:status", (payload) => {
      if (payload?.bookingId !== bookingId) return;
      console.log("📡 booking:status:", payload);
      setBooking((prev) => ({ ...prev, status: payload.status }));
      if (payload.driver) setDriver(payload.driver);
    });

    socketRef.current = s;
    return () => s.disconnect();
  }, [bookingId]);

  // 🟡 Refetch once socket connected to ensure fresh data
  useEffect(() => {
    if (socketConnected && bookingId) {
      fetchBooking();
    }
  }, [socketConnected, bookingId]);

  // --- derived UI ---
  const canCancel =
    booking && ["requested", "pending", "broadcasting"].includes(booking.status);

  const showDriverCard =
    booking &&
    ["confirmed", "driver_accepted", "enroute", "arrived", "in_ride", "completed"].includes(
      booking.status
    ) &&
    driver;

  // --- auto-redirect after completion ---
  useEffect(() => {
    if (!booking) return;
    if (booking.status === "completed") {
      const t = setTimeout(() => navigate("/dashboard/bookings"), 2000);
      return () => clearTimeout(t);
    }
  }, [booking, navigate]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Ride Status
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {booking && (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.5}
            sx={{ mb: 1 }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6">
                {booking.pickupLocation} → {booking.destination}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Price: {booking.price ? `€${Number(booking.price).toFixed(2)}` : "—"} • ETA:{" "}
                {booking.eta ? `${booking.eta} min` : "—"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`Status: ${booking.status}`} color={statusColor} />
              <Chip
                label={socketConnected ? "Live" : "Offline"}
                color={socketConnected ? "success" : "default"}
                variant={socketConnected ? "filled" : "outlined"}
              />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* WAITING UI */}
          {["requested", "pending", "broadcasting"].includes(booking.status) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
              <Typography variant="body1" sx={{ opacity: 0.85 }}>
                We’re finding a nearby driver for you…
              </Typography>
              <LinearProgress sx={{ width: "100%", maxWidth: 520 }} />
              {canCancel && (
                <Button onClick={handleCancel} color="error" variant="outlined">
                  Cancel Ride
                </Button>
              )}
            </Stack>
          )}

          {/* DRIVER ACCEPTED / ONGOING */}
          {showDriverCard && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                py: 2,
                px: 2,
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 2,
                background: "#f9fafb",
              }}
            >
              <Avatar src={driver?.profileImage || ""}>
                {driver?.name?.[0]?.toUpperCase() || "D"}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {driver?.name || "Your driver"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {driver?.vehicle
                    ? `${driver.vehicle?.make || ""} ${driver.vehicle?.model || ""} • ${
                        driver.vehicle?.color || ""
                      } • ${driver.vehicle?.plate || ""}`
                    : "Vehicle details coming up…"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {booking.status === "confirmed" && "Driver accepted — heading to you…"}
                  {booking.status === "enroute" && "Driver is en route to pickup."}
                  {booking.status === "arrived" && "Driver has arrived."}
                  {booking.status === "in_ride" && "Ride in progress…"}
                  {booking.status === "completed" && "Ride completed — thank you!"}
                </Typography>
              </Box>
            </Stack>
          )}

          {/* CANCELLED / EXPIRED */}
          {["expired", "cancelled"].includes(booking.status) && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
              <Typography variant="body1" color="error">
                {booking.status === "expired"
                  ? "No drivers accepted this time."
                  : "Ride was cancelled."}
              </Typography>
              <Button variant="contained" onClick={() => navigate("/dashboard/bookings/new")}>
                Try Again
              </Button>
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}
