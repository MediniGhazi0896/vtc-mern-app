// NewBooking.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Grid,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";

// ✅ Leaflet marker assets fix (Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Pins
const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// ✅ Car icons
const CAR_URL = "https://cdn-icons-png.flaticon.com/512/61/61168.png";
const makeCarIcon = (size = 30) =>
  new L.Icon({
    iconUrl: CAR_URL,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
const carIcon = makeCarIcon(30);
const carIconSelected = makeCarIcon(42);

// ✅ Services
const companyGroups = [
  {
    category: "Economy",
    options: [
      { key: "drivelink", name: "DriveLink", color: "#1976d2", seats: 4 },
      { key: "bolt", name: "Bolt", color: "#2e7d32", seats: 4 },
    ],
  },
  {
    category: "Comfort",
    options: [
      { key: "dl_premium", name: "DriveLink Premium", color: "#6a1b9a", seats: 4 },
      { key: "uber_comfort", name: "Uber Comfort", color: "#ef6c00", seats: 4 },
    ],
  },
  {
    category: "Business",
    options: [
      { key: "black", name: "Black", color: "#000000", seats: 4 },
      { key: "lux", name: "Lux", color: "#c0a000", seats: 4 },
    ],
  },
];

const flatServices = companyGroups.flatMap((g) =>
  g.options.map((o) => ({ ...o, category: g.category }))
);

const NewBooking = () => {
  const [form, setForm] = useState({
    pickupLocation: "",
    destination: "",
    date: "",
  });

  const [routeInfo, setRouteInfo] = useState(null);
  const [showOffers, setShowOffers] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [surgeFactor, setSurgeFactor] = useState(1);

  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const carMarkersRef = useRef(new Map());
  const carOffsetsRef = useRef(new Map());
  const animTimerRef = useRef(null);
  const routeCoordsRef = useRef([]);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ✅ Submit booking
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedKey) {
    alert("Please select a ride option first.");
    return;
  }

  try {
    const chosen = priceAndEta.get(selectedKey);
    const res = await API.post("/bookings", {
      pickupLocation: form.pickupLocation,
      destination: form.destination,
      service: selectedKey,
      price: parseFloat(chosen.price),
      eta: chosen.eta,
    });

    // ✅ booking ID is inside res.data.booking
    navigate(`/booking/status/${res.data.booking._id}`);
  } catch (err) {
    console.error(err);
    alert("❌ Failed to create booking");
  }
};

  // -------- Pricing Engine --------
  const priceAndEta = useMemo(() => {
    const distanceKm = routeInfo?.distanceKm ?? 0;
    const durationMin = routeInfo?.durationMin ?? 0;

    const model = {
      Economy: { base: 3, perKm: 1.1, perMin: 0.2 },
      Comfort: { base: 5, perKm: 1.6, perMin: 0.3 },
      Business: { base: 8, perKm: 2.2, perMin: 0.4 },
    };

    const result = new Map();
    flatServices.forEach((s) => {
      const m = model[s.category] ?? model.Economy;
      let price = m.base + m.perKm * distanceKm + m.perMin * durationMin;
      price = price * surgeFactor;
      const eta = Math.max(3, Math.round(durationMin * 0.15) + (s.key.length % 5));
      result.set(s.key, { price: price.toFixed(2), eta });
    });
    return result;
  }, [routeInfo, surgeFactor]);

  // -------- Geocoding & Route --------
  const geocodeAddress = async (address, type) => {
    if (!address) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (!data?.length) return;

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (!mapRef.current) return;

      if (type === "pickup") {
        if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
        pickupMarkerRef.current = L.marker([lat, lng], { icon: pickupIcon }).addTo(mapRef.current);
        mapRef.current.setView([lat, lng], 13);
      } else {
        if (destinationMarkerRef.current) destinationMarkerRef.current.remove();
        destinationMarkerRef.current = L.marker([lat, lng], { icon: destinationIcon }).addTo(mapRef.current);
        mapRef.current.setView([lat, lng], 13);
      }

      if (pickupMarkerRef.current && destinationMarkerRef.current) {
        const group = L.featureGroup([pickupMarkerRef.current, destinationMarkerRef.current]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });

        const start = pickupMarkerRef.current.getLatLng();
        const end = destinationMarkerRef.current.getLatLng();
        await drawRoute(start, end);
        spawnCars();
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const drawRoute = async (start, end) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (!data?.routes?.length) return;

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
      routeCoordsRef.current = coords;

      if (routeLayerRef.current) routeLayerRef.current.remove();

      routeLayerRef.current = L.polyline(coords, { color: "#1976d2", weight: 4 }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });

      setRouteInfo({
        distanceKm: route.distance / 1000,
        durationMin: Math.round(route.duration / 60),
      });
    } catch (err) {
      console.error("Route error:", err);
    }
  };

  // -------- Cars --------
  const clearCars = () => {
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    carMarkersRef.current.forEach((m) => m.remove());
    carMarkersRef.current.clear();
    carOffsetsRef.current.clear();
  };

  const spawnCars = () => {
    clearCars();
    const coords = routeCoordsRef.current;
    if (!coords.length || !mapRef.current) return;

    const step = Math.max(1, Math.floor(coords.length / (flatServices.length + 1)));

    flatServices.forEach((service, i) => {
      const offset = step * (i + 1);
      const pos = coords[offset % coords.length];
      const marker = L.marker(pos, {
        icon: service.key === selectedKey ? carIconSelected : carIcon,
        title: service.name,
        zIndexOffset: service.key === selectedKey ? 1000 : 0,
      }).addTo(mapRef.current);

      carMarkersRef.current.set(service.key, marker);
      carOffsetsRef.current.set(service.key, offset);
    });

    let t = 0;
    animTimerRef.current = setInterval(() => {
      t += 1;
      flatServices.forEach((service) => {
        const base = carOffsetsRef.current.get(service.key) ?? 0;
        const idx = (base + t) % coords.length;
        const marker = carMarkersRef.current.get(service.key);
        if (marker) marker.setLatLng(coords[idx]);
      });
    }, 800);
  };

  const selectOffer = (key) => {
    setSelectedKey(key);
    carMarkersRef.current.forEach((marker, k) => {
      marker.setIcon(k === key ? carIconSelected : carIcon);
      marker.setZIndexOffset(k === key ? 1000 : 0);
    });
  };

  // -------- Init map once --------
  useEffect(() => {
    if (!mapRef.current && document.getElementById("map")) {
      const map = L.map("map").setView([51.1657, 10.4515], 6);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
    }

    return () => {
      clearCars();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh" }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Create New Booking
      </Typography>

      <Grid container spacing={3}>
        {/* LEFT: Form */}
        <Grid item xs={12} md={4}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="pickupLocation"
              label="Pickup Location"
              value={form.pickupLocation}
              onChange={handleChange}
              onBlur={() => geocodeAddress(form.pickupLocation, "pickup")}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <LocationOnIcon color="primary" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="destination"
              label="Destination"
              value={form.destination}
              onChange={handleChange}
              onBlur={() => geocodeAddress(form.destination, "destination")}
              required
            />

            <TextField
              name="date"
              label="Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={handleChange}
              required
            />

            {/* ✅ Dynamic button behavior */}
            {!routeInfo ? (
              <Button disabled variant="contained">
                Select Route
              </Button>
            ) : !showOffers ? (
              <Button
                onClick={() => {
                  setSurgeFactor(1 + Math.random() * 0.5); // 1.0–1.5 surge
                  setShowOffers(true);
                }}
                variant="contained"
                color="secondary"
              >
                See Prices
              </Button>
            ) : (
              <Button type="submit" variant="contained" color="primary">
                Confirm Booking
              </Button>
            )}

            {routeInfo && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Distance: <b>{routeInfo.distanceKm.toFixed(2)} km</b> &nbsp;|&nbsp; Duration:{" "}
                <b>{routeInfo.durationMin} mins</b>
              </Typography>
            )}
          </Box>
        </Grid>

        {/* MIDDLE: Offers */}
        <Grid item xs={12} md={4}>
          {showOffers ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Choose a Ride (Surge x{surgeFactor.toFixed(2)})
              </Typography>
              {companyGroups.map((group) => (
                <Box key={group.category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    {group.category}
                  </Typography>
                  <Stack spacing={1.25}>
                    {group.options.map((opt) => {
                      const sel = selectedKey === opt.key;
                      const pr = priceAndEta.get(opt.key);
                      return (
                        <Box
                          key={opt.key}
                          onClick={() => selectOffer(opt.key)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: "pointer",
                            border: sel ? `2px solid ${opt.color}` : "1px solid rgba(0,0,0,0.12)",
                            boxShadow: sel ? "0 8px 16px rgba(0,0,0,0.18)" : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "0.2s ease",
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <DirectionsCarIcon sx={{ color: opt.color }} />
                            <Box>
                              <Typography sx={{ fontWeight: 700, lineHeight: 1 }}>{opt.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {opt.seats} seats • ETA {pr?.eta ?? 6} min
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography variant="h6">€{pr?.price ?? "—"}</Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select pickup and destination, then click <b>See Prices</b>.
            </Typography>
          )}
        </Grid>

        {/* RIGHT: Map */}
        <Grid item xs={12} md={4} sx={{ height: "500px", width: "500px" }}>
          <Box
            id="map"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NewBooking;
