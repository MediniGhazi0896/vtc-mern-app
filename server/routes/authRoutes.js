// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ Helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*]/.test(password);
const isValidPhone = (phone) => /^\+\d{6,15}$/.test(phone); // + followed by 6–15 digits

// ✅ REGISTER
router.post("/register", async (req, res) => {
  let { name, email, phone, password, role, vehicle, driverLicense } = req.body;

  if (!name || !email || !phone || !password)
    return res.status(400).json({ message: "Name, email, phone, and password are required" });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Invalid email format" });

  if (!isValidPhone(phone))
    return res.status(400).json({
      message: "Invalid phone number format. Use +countrycode and digits only.",
    });

  if (!isStrongPassword(password))
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
    });

  try {
    // Case-insensitive duplicate check
    const existingEmail = await User.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });
    if (existingEmail)
      return res.status(400).json({ message: "Email already registered" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ message: "Phone number already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashed,
      role: role || "traveller",
    });

    // ✅ If registering as driver, attach vehicle + license info
    if (role === "driver") {
      newUser.vehicle = {
        make: vehicle?.make || "",
        model: vehicle?.model || "",
        color: vehicle?.color || "",
        plate: vehicle?.plate || "",
        seats: vehicle?.seats || 4,
      };
      newUser.driverLicense = driverLicense || "";
    }

    const user = await newUser.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicle: user.vehicle,
        driverLicense: user.driverLicense,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ LOGIN (case-insensitive)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicle: user.vehicle,
        driverLicense: user.driverLicense,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
