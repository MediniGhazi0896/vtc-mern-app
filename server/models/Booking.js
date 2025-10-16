// server/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    pickupLocation: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  /* required: true ,*/
},

    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ✅ New fields
    service: { type: String }, // e.g. drivelink, bolt, etc.
    price: { type: Number },
    eta: { type: Number }, // minutes

    rejectedDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ drivers who rejected
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
