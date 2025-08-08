// models/Booking.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  assignedDriver: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
},
status: {
  type: String,
  enum: ['Pending', 'Confirmed', 'Cancelled'],
  default: 'Pending'
}
  
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
