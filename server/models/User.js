// server/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vehicleSchema = new mongoose.Schema({
  make: { type: String, trim: true },
  model: { type: String, trim: true },
  color: { type: String, trim: true },
  plate: { type: String, trim: true },
  seats: { type: Number, default: 4 },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["traveller", "driver", "admin"], default: "traveller" },
    isAvailable: { type: Boolean, default: false },

    // ✅ Extended Driver Data
    vehicle: vehicleSchema,
    driverLicense: { type: String },
    profileImage: { type: String },

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
