import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middlewares/authMiddleware.js';
const router = express.Router();

// ✅ Helpers
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*]/.test(password);

const isValidPhone = (phone) =>
  /^\+\d{6,15}$/.test(phone); // ✅ + followed by 6–15 digits

// ✅ REGISTER
router.post("/register", async (req, res) => {
  let { name, email, phone, password, role } = req.body;

  // Validation
  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, phone, and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({
      message:
        "Invalid phone number format. Use +countrycode and digits only.",
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    // Case-insensitive duplicate check
    const existingEmail = await User.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Save email exactly as user typed it (preserve casing)
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: role || "traveller",
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ LOGIN (case-insensitive)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
   

    // Case-insensitive lookup
    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });

    if (!user) {
      console.log("No user found for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;