// server/routes/bookingsRoutes.js
import express from "express";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getIO } from "../socket.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🟢 GET: DRIVER BOOKINGS — must come BEFORE /:id to avoid CastError         */
/* -------------------------------------------------------------------------- */
router.get("/driver", authenticate, async (req, res) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const bookings = await Booking.find({ assignedDriver: req.user.id })
      .populate("userId", "name email")
      .populate("assignedDriver", "name email vehicle")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("❌ Driver bookings fetch error:", err);
    res.status(500).json({ message: "Failed to load driver bookings" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟠 GET: ALL BOOKINGS (for admin or user)                                  */
/* -------------------------------------------------------------------------- */
router.get("/", authenticate, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    const bookings = await Booking.find(filter)
      .populate("userId", "name email")
      .populate("assignedDriver", "name email vehicle");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Booking fetch error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟢 POST: CREATE BOOKING (only after user selects service)                 */
/* -------------------------------------------------------------------------- */
router.post("/", authenticate, async (req, res) => {
  const { pickupLocation, destination, service, price, eta } = req.body;
  if (!pickupLocation || !destination || !service) {
    return res
      .status(400)
      .json({ message: "Pickup, destination, and service required" });
  }

  try {
    const booking = new Booking({
      userId: req.user.id,
      pickupLocation,
      destination,
      service,
      price,
      eta,
      status: "pending",
      rejectedDrivers: [],
    });

    const saved = await booking.save();

    const io = getIO();
    const availableDrivers = await User.find({ role: "driver", isAvailable: true });

    console.log(`📢 Broadcasting new ride to ${availableDrivers.length} available drivers...`);

    availableDrivers.forEach((driver) => {
      io.to(driver._id.toString()).emit("ride:new", saved);
    });

    res.status(201).json({
      booking: saved,
      driver: null,
    });
  } catch (err) {
    console.error("❌ Booking creation error:", err);
    res.status(400).json({ message: "Booking creation failed" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟢 POST: DRIVER ACCEPTS BOOKING                                           */
/* -------------------------------------------------------------------------- */
router.post("/:id/accept", authenticate, async (req, res) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can accept rides" });
  }

  try {
    const driver = await User.findById(req.user.id);
    if (!driver.isAvailable) {
      return res.status(400).json({ message: "Driver is unavailable" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("userId", "name email")
      .populate("assignedDriver", "name email vehicle");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is not available" });
    }

    booking.status = "confirmed";
    booking.assignedDriver = driver._id;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("assignedDriver", "name email vehicle");

    const io = getIO();
    io.emit("ride:update", updated);

    res.json({ booking: updated, driver: updated.assignedDriver });
  } catch (err) {
    console.error("❌ Accept booking error:", err);
    res.status(500).json({ message: "Failed to accept booking" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟢 POST: DRIVER REJECTS BOOKING (without cancelling for others)           */
/* -------------------------------------------------------------------------- */
router.post("/:id/reject", authenticate, async (req, res) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can reject rides" });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.rejectedDrivers.includes(req.user.id)) {
      booking.rejectedDrivers.push(req.user.id);
      await booking.save();
    }

    res.json({
      success: true,
      message: "Ride rejected for this driver only",
    });
  } catch (err) {
    console.error("❌ Reject booking error:", err);
    res.status(500).json({ message: "Failed to reject booking" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟢 PATCH: UPDATE BOOKING STATUS                                           */
/* -------------------------------------------------------------------------- */
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "cancelled", "completed", "confirmed"];

    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("userId assignedDriver", "name email role vehicle");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status.toLowerCase();
    await booking.save();

    const updated = await Booking.findById(req.params.id)
      .populate("userId", "name email")
      .populate("assignedDriver", "name email vehicle");

    const io = getIO();
    io.emit("ride:update", updated);

    res.json({ booking: updated, driver: updated.assignedDriver });
  } catch (err) {
    console.error("❌ Failed to update booking status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
