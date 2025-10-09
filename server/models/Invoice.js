import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", /* required: true */ },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", /* required: true  */},
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },

    amount: { type: Number, required: true }, // cents
    currency: { type: String, default: "EUR" },
    method: { type: String, enum: ["card", "cash", "wallet"], default: "card" },
    status: { type: String, enum: ["paid", "unpaid"], default: "paid" },

    // We’ll generate this in Phase 2 (PDF)
    pdfUrl: { type: String, default: null },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
