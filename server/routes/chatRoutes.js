import express from 'express';
import Message from '../models/ChatMessage.js';
import Booking from '../models/Booking.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get messages for a booking
router.get('/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only user who made booking or assigned driver can see messages
    const isAuthorized =
      req.user.id === booking.userId.toString() ||
      req.user.id === booking.assignedDriver?.toString();

    if (!isAuthorized)
      return res.status(403).json({ message: 'Not authorized to view messages' });

    const messages = await Message.find({ bookingId: booking._id })
      .sort({ timestamp: 1 })
      .populate('sender', 'name');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
});

// Send a message
router.post('/', authenticate, async (req, res) => {
  const { bookingId, content } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isAuthorized =
      req.user.id === booking.userId.toString() ||
      req.user.id === booking.assignedDriver?.toString();

    if (!isAuthorized)
      return res.status(403).json({ message: 'Not authorized to send message' });

    const message = await Message.create({
      bookingId,
      sender: req.user.id,
      content
    });

    const populated = await message.populate('sender', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

export default router;
