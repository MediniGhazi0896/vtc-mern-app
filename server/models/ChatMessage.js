// server/models/ChatMessage.js
import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Index for faster lookup of booking messages
ChatMessageSchema.index({ bookingId: 1, timestamp: 1 });

export default mongoose.model("ChatMessage", ChatMessageSchema);
