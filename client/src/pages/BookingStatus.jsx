import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  Divider,
  Stack,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";

// ✅ Car & marker icons
const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61168.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const BookingStatus = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const carRef = useRef(null);
  const carAnimTimer = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* SOCKET                                                                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const s = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");
    s.on("connect", () => console.log("✅ Connected to socket:", s.id));

    s.on("ride:update", (payload) => {
      if (payload.booking?._id === bookingId) {
        console.log("📡 ride:update:", payload);
        setBooking(payload.booking);
        setDriver(payload.driver);
      }
    });

    return () => s.disconnect();
  }, [bookingId]);

  /* -------------------------------------------------------------------------- */
  /* FETCH BOOKING                                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await API.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
        setDriver(res.data.driver || null);
      } catch (err) {
        console.error("❌ Failed to fetch booking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  /* -------------------------------------------------------------------------- */
  /* MAP INITIALIZATION                                                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!mapRef.current && !loading && booking) {
      mapRef.current = L.map("status-map").setView([51.1657, 10.4515], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, [loading, booking]);

  /* -------------------------------------------------------------------------- */
  /* DRAW ROUTE WHEN DRIVER IS ASSIGNED                                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!booking || !driver || !mapRef.current) return;

    const drawRoute = async () => {
      try {
        // Mock or real driver coordinates (for demo, random near pickup)
        const pickupAddress = booking.pickupLocation;
        const nominatim = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            pickupAddress
          )}`
        );
        const pickupData = await nominatim.json();
        if (!pickupData?.length) return;
        const pickupLatLng = [
          parseFloat(pickupData[0].lat),
          parseFloat(pickupData[0].lon),
        ];

        // Simulate driver start 10km away from pickup
        const driverLatLng = [
          pickupLatLng[0] + 0.08 * (Math.random() > 0.5 ? 1 : -1),
          pickupLatLng[1] + 0.08 * (Math.random() > 0.5 ? 1 : -1),
        ];

        // Add markers
        const driverMarker = L.marker(driverLatLng, { icon: carIcon }).addTo(mapRef.current);
        carRef.current = driverMarker;
        const pickupMarker = L.marker(pickupLatLng, { icon: pickupIcon }).addTo(mapRef.current);

        // Fit map
        const group = L.featureGroup([driverMarker, pickupMarker]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });

        // Fetch route
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${driverLatLng[1]},${driverLatLng[0]};${pickupLatLng[1]},${pickupLatLng[0]}?overview=full&geometries=geojson`
        );
        const routeJson = await routeRes.json();
        const coords = routeJson.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);

        if (routeRef.current) routeRef.current.remove();
        routeRef.current = L.polyline(coords, { color: "blue", weight: 5 }).addTo(mapRef.current);

        // Animate driver icon
        let i = 0;
        clearInterval(carAnimTimer.current);
        carAnimTimer.current = setInterval(() => {
          if (i < coords.length) {
            carRef.current.setLatLng(coords[i]);
            i++;
          } else {
            clearInterval(carAnimTimer.current);
          }
        }, 500);
      } catch (err) {
        console.error("🗺️ Route drawing error:", err);
      }
    };

    drawRoute();

    return () => {
      if (routeRef.current) routeRef.current.remove();
      if (carRef.current) carRef.current.remove();
      clearInterval(carAnimTimer.current);
    };
  }, [driver, booking]);

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your booking...</Typography>
      </Box>
    );

  if (!booking)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="error">
          Booking not found.
        </Typography>
      </Box>
    );

  const v = driver?.vehicle || {};

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 4 },
        mt: 6,
        maxWidth: 1100,
        mx: "auto",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🚖 Booking Status
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems="flex-start"
      >
        {/* Left — Driver Info */}
        <Box flex={1}>
          <Typography variant="subtitle1">
            From: <b>{booking.pickupLocation}</b>
          </Typography>
          <Typography variant="subtitle1">
            To: <b>{booking.destination}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Service: {booking.service?.toUpperCase()}
          </Typography>

          <Chip
            label={booking.status?.toUpperCase()}
            color={
              booking.status === "confirmed"
                ? "info"
                : booking.status === "completed"
                ? "success"
                : booking.status === "cancelled"
                ? "error"
                : "warning"
            }
            sx={{ mt: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Assigned Driver
          </Typography>

          {driver ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 56,
                  height: 56,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {driver.name?.charAt(0) || "D"}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {driver.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {driver.email}
                </Typography>
                {v.make && (
                  <Typography variant="body2" color="text.secondary">
                    🚗 {v.make} {v.model} • {v.color}
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={2} sx={{ mt: 2 }}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">
                Searching for available drivers...
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            Estimated arrival: <b>{booking.eta || "—"} min</b> &nbsp; | &nbsp;
            Fare: <b>€{booking.price?.toFixed(2) || "—"}</b>
          </Typography>
        </Box>

        {/* Right — Map */}
        <Box
          flex={1}
          sx={{
            width: "100%",
            height: 400,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div id="status-map" style={{ height: "100%", width: "100%" }}></div>
        </Box>
      </Stack>
    </Paper>
  );
};

export default BookingStatus;
