// models/SupportTicket.js
import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:  { type: String, required: true },
  message:  { type: String, required: true },
  status:   { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
}, { timestamps: true });

export default mongoose.model('SupportTicket', SupportTicketSchema);
