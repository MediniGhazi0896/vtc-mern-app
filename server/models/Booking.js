import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    pickupLocation: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'], // 🔑 added completed
      default: 'pending',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
