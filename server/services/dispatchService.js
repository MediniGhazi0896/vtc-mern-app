import Booking from "../models/Booking.js";
import { io } from "../socket.js";

// ✅ Start dispatch for a booking
export const startDispatch = async (booking) => {
  try {
    // Update booking status to "offered"
    booking.status = "offered";
    await booking.save();

    // Broadcast to all available drivers
    io.emit("ride:new", {
      bookingId: booking._id,
      pickupLocation: booking.pickupLocation,
      destination: booking.destination,
      date: booking.date,
    });

    console.log(`🚖 Dispatch started for booking ${booking._id}`);
  } catch (err) {
    console.error("Dispatch error:", err);
  }
};

// ✅ Driver accepts a ride
export const acceptRide = async (bookingId, driverId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== "offered") return null;

  booking.status = "accepted";
  booking.driverId = driverId;
  await booking.save();

  // Notify rider
  io.emit(`ride:update:${bookingId}`, {
    status: "accepted",
    driverId,
  });

  return booking;
};

// ✅ Driver rejects a ride
export const rejectRide = async (bookingId, driverId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== "offered") return null;

  booking.status = "rejected";
  await booking.save();

  // Notify rider
  io.emit(`ride:update:${bookingId}`, {
    status: "rejected",
    driverId,
  });

  return booking;
};
