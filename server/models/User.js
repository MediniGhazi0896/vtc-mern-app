import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+\d{6,15}$/, "Invalid phone number format"], // ✅ e.g. +49123456789
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["traveller", "driver", "admin"], // ✅ aligned with frontend
      default: "traveller",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    profileImage: {
      type: String,
      default: "", // placeholder if not provided
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
