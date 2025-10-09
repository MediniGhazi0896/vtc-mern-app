import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", /* required: true */ },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", /* required: true */ },
    amount: { type: Number, required: true }, // in minor units (cents)
    currency: { type: String, default: "EUR" },
    method: { type: String, enum: ["card", "cash", "wallet"], default: "card" },

    // Stripe fields
    paymentIntentId: { type: String, index: true },
    chargeId: { type: String },
    receiptUrl: { type: String },

    status: {
      type: String,
      enum: ["requires_payment", "processing", "succeeded", "failed", "canceled"],
      default: "requires_payment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
