// server/routes/chatRoutes.js
import express from "express";
import Message from "../models/ChatMessage.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getIO } from "../socket.js";

const router = express.Router();

/**
 * ✅ Get unread chat notifications count
 * GET /api/messages/unread
 */
router.get("/unread", authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      type: "chat",
    });
    res.json({ count });
  } catch (err) {
    console.error("❌ Failed to fetch unread chat notifications:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch unread chat notifications" });
  }
});

/**
 * ✅ Get messages for a booking
 * GET /api/messages/:bookingId
 */
router.get("/:bookingId", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Authorization: only rider or assigned driver
    const isAuthorized =
      req.user.id === booking.userId.toString() ||
      req.user.id === booking.assignedDriver?.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to view messages" });
    }

    const messages = await Message.find({ bookingId: booking._id })
      .sort({ timestamp: 1 })
      .populate("sender", "name");

    res.json(messages);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: err.message });
  }
});

/**
 * ✅ Send a message
 * POST /api/messages
 */
router.post("/", authenticate, async (req, res) => {
  const { bookingId, content } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Authorization: only rider or assigned driver
    const isAuthorized =
      req.user.id === booking.userId.toString() ||
      req.user.id === booking.assignedDriver?.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to send message" });
    }

    // Save message
    const message = await Message.create({
      bookingId,
      sender: req.user.id,
      content,
    });

    const populated = await message.populate("sender", "name");

    // ✅ Create notification for the recipient
    let recipientId = null;
    if (req.user.id === booking.userId.toString()) {
      // Rider sent → notify driver
      recipientId = booking.assignedDriver || null;
    } else if (
      booking.assignedDriver &&
      req.user.id === booking.assignedDriver.toString()
    ) {
      // Driver sent → notify rider
      recipientId = booking.userId;
    }

    if (recipientId) {
      await Notification.create({
        user: recipientId,
        type: "chat",
        title: "New Chat Message",
        message: `💬 New message from ${populated.sender.name}`,
        link: `/dashboard/chat/${bookingId}`,
      });

      // Real-time push
      getIO().to(recipientId.toString()).emit("notification", {
        type: "chat",
        title: "New Chat Message",
        message: `💬 New message in booking chat`,
        link: `/dashboard/chat/${bookingId}`,
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Failed to send message:", err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
});

export default router;
