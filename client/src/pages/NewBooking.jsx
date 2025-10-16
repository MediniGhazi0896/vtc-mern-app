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

// ✅ Fix Leaflet icons for Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Custom marker icons
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

// ✅ Import your car image (rename uploaded one to car-icon.png)
import carBaseIcon from "../assets/car-icon.png";

// ✅ Define car icons by category
const carIcons = {
  Economy: new L.Icon({
    iconUrl: carBaseIcon,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    className: "car-economy",
  }),
  Comfort: new L.Icon({
    iconUrl: carBaseIcon,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: "car-comfort",
  }),
  Business: new L.Icon({
    iconUrl: carBaseIcon,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    className: "car-business",
  }),
};

// ✅ Service Groups
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
  const [form, setForm] = useState({ pickupLocation: "", destination: "", date: "" });
  const [routeInfo, setRouteInfo] = useState(null);
  const [showOffers, setShowOffers] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [surgeFactor, setSurgeFactor] = useState(1);

  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const carDataRef = useRef([]);
  const animTimerRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  /* -------------------------------------------------------------------------- */
  /* SUBMIT BOOKING */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKey) return alert("Please select a ride option first.");

    try {
      const chosen = priceAndEta.get(selectedKey);
      const res = await API.post("/bookings", {
        pickupLocation: form.pickupLocation,
        destination: form.destination,
        service: selectedKey,
        price: parseFloat(chosen.price),
        eta: chosen.eta,
      });
      const bookingId = res.data.booking?._id || res.data._id;
      await handlePayment(bookingId);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create booking");
    }
  };
// 🚀 Pay with Stripe
const handlePayment = async (bookingId) => {
  try {
    const res = await API.post("/payments/create-session", { bookingId });
    if (res.data.url) {
      window.location.href = res.data.url; // redirect to Stripe
    } else {
      alert("Payment session creation failed");
    }
  } catch (err) {
    console.error("Payment error:", err);
    alert("Failed to start payment");
  }
};

  /* -------------------------------------------------------------------------- */
  /* PRICE ENGINE */
  /* -------------------------------------------------------------------------- */
  const priceAndEta = useMemo(() => {
    const d = routeInfo?.distanceKm ?? 0;
    const t = routeInfo?.durationMin ?? 0;
    const model = {
      Economy: { base: 3, perKm: 1.1, perMin: 0.2 },
      Comfort: { base: 5, perKm: 1.6, perMin: 0.3 },
      Business: { base: 8, perKm: 2.2, perMin: 0.4 },
    };
    const result = new Map();
    flatServices.forEach((s) => {
      const m = model[s.category];
      let price = (m.base + m.perKm * d + m.perMin * t) * surgeFactor;
      const eta = Math.max(3, Math.round(t * 0.15) + (s.key.length % 5));
      result.set(s.key, { price: price.toFixed(2), eta });
    });
    return result;
  }, [routeInfo, surgeFactor]);

  /* -------------------------------------------------------------------------- */
  /* MAP + GEOCODING */
  /* -------------------------------------------------------------------------- */
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
        mapRef.current.setView([lat, lng], 15);
        spawnCarsOnNearbyRoads(lat, lng);
      } else {
        if (destinationMarkerRef.current) destinationMarkerRef.current.remove();
        destinationMarkerRef.current = L.marker([lat, lng], { icon: destinationIcon }).addTo(mapRef.current);
      }

      if (pickupMarkerRef.current && destinationMarkerRef.current) {
        const group = L.featureGroup([pickupMarkerRef.current, destinationMarkerRef.current]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        const start = pickupMarkerRef.current.getLatLng();
        const end = destinationMarkerRef.current.getLatLng();
        await drawRoute(start, end);
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
      if (routeLayerRef.current) routeLayerRef.current.remove();

      routeLayerRef.current = L.polyline(coords, { color: "#1976d2", weight: 4 }).addTo(mapRef.current);
      setRouteInfo({ distanceKm: route.distance / 1000, durationMin: Math.round(route.duration / 60) });
    } catch (err) {
      console.error("Route error:", err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🚕 CITY DRIVE AI v3 - realistic roaming cars + direction alignment */
  /* -------------------------------------------------------------------------- */
  const clearCars = () => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    carDataRef.current.forEach((c) => c.marker.remove());
    carDataRef.current = [];
  };

  const spawnCarsOnNearbyRoads = async (lat, lng) => {
    clearCars();
    const map = mapRef.current;
    if (!map) return;

    try {
      const overpassURL = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:15];
        way["highway"](around:600,${lat},${lng});
        out geom;`;
      const res = await fetch(overpassURL);
      const data = await res.json();
      const roads = data?.elements?.filter((el) => el.type === "way" && el.geometry?.length > 3);
      if (!roads?.length) return spawnFallbackCars(lat, lng);

      const numCars = flatServices.length;
      for (let i = 0; i < numCars; i++) {
        const road = roads[Math.floor(Math.random() * roads.length)];
        const coords = road.geometry.map((g) => [g.lat, g.lon]);
        const start = coords[Math.floor(Math.random() * coords.length)];
        const service = flatServices[i % flatServices.length];
        const icon = carIcons[service.category];
        const marker = L.marker(start, { icon }).addTo(map);

        carDataRef.current.push({
          marker,
          coords,
          index: 0,
          speed: 0.00003 + Math.random() * 0.00002,
          idle: false,
        });
      }

      // 🕹️ Animate cars with proper direction + smooth turns
      animTimerRef.current = setInterval(() => {
        carDataRef.current.forEach((car) => {
          if (!car.coords?.length || car.idle) return;

          const curr = car.coords[car.index];
          const next = car.coords[car.index + 1];
          if (!next) {
            const nextRoad = roads[Math.floor(Math.random() * roads.length)];
            car.coords = nextRoad.geometry.map((g) => [g.lat, g.lon]);
            car.index = 0;
            if (Math.random() < 0.3) {
              car.idle = true;
              setTimeout(() => (car.idle = false), 1200 + Math.random() * 2000);
            }
            return;
          }

          // Smooth movement
          const stepSize = car.speed;
          const latDiff = next[0] - curr[0];
          const lngDiff = next[1] - curr[1];
          const newLat = curr[0] + latDiff * stepSize;
          const newLng = curr[1] + lngDiff * stepSize;

          // Compute geographic bearing for direction
          const toRad = (deg) => (deg * Math.PI) / 180;
          const toDeg = (rad) => (rad * 180) / Math.PI;
          const lat1 = toRad(curr[0]);
          const lon1 = toRad(curr[1]);
          const lat2 = toRad(next[0]);
          const lon2 = toRad(next[1]);
          const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
          const x =
            Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
          let bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

          // Rotate car smoothly toward direction
          const iconEl = car.marker._icon;
          if (iconEl) {
            const currentRotation = parseFloat(iconEl.dataset.rotation || 0);
            const diff = ((bearing - currentRotation + 540) % 360) - 180;
            const smoothed = currentRotation + diff * 0.15;
            iconEl.style.transform = `rotate(${smoothed - 90}deg)`;
            iconEl.dataset.rotation = smoothed;
          }

          car.marker.setLatLng([newLat, newLng]);
          car.index += 1;
        });
      }, 400);
    } catch (err) {
      console.error("City drive AI error:", err);
      spawnFallbackCars(lat, lng);
    }
  };

  const spawnFallbackCars = (lat, lng) => {
    const radius = 0.008;
    const map = mapRef.current;
    flatServices.forEach((s, i) => {
      const angle = (i / flatServices.length) * 2 * Math.PI;
      const carLat = lat + radius * Math.cos(angle);
      const carLng = lng + radius * Math.sin(angle);
      const marker = L.marker([carLat, carLng], { icon: carIcons[s.category] }).addTo(map);
      carDataRef.current.push({ marker, angle, speed: 0.02 });
    });
    animTimerRef.current = setInterval(() => {
      carDataRef.current.forEach((c) => {
        c.angle += c.speed;
        const newLat = lat + radius * Math.cos(c.angle);
        const newLng = lng + radius * Math.sin(c.angle);
        c.marker.setLatLng([newLat, newLng]);
      });
    }, 700);
  };

  const selectOffer = (key) => {
    setSelectedKey(key);
    carDataRef.current.forEach((c) => c.marker.setIcon(carIcons[c.category]));
  };

  /* -------------------------------------------------------------------------- */
  /* INIT MAP */
  /* -------------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */
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

            {!routeInfo ? (
              <Button disabled variant="contained">
                Select Route
              </Button>
            ) : !showOffers ? (
              <Button
                onClick={() => {
                  setSurgeFactor(1 + Math.random() * 0.5);
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
                              <Typography sx={{ fontWeight: 700 }}>{opt.name}</Typography>
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
