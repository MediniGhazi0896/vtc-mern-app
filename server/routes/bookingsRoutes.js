import express from 'express';
import Booking from '../models/Booking.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/bookings — Get all bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(filter).populate('userId', 'name email');
    res.status(200).json(bookings);
  } catch (err) {
    console.error('❌ Booking fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id — Get one booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('userId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(booking);
  } catch (err) {
    console.error('❌ Fetch single booking error:', err);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// POST /api/bookings — Create a new booking
router.post('/', authenticate, async (req, res) => {
  const { pickupLocation, destination, status } = req.body;

  if (!pickupLocation || !destination) {
    return res.status(400).json({ message: 'Pickup and destination are required' });
  }

  try {
    const booking = new Booking({
      userId: req.user.id,
      pickupLocation,
      destination,
      status: status || 'Pending',
    });

    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Booking creation error:', err);
    res.status(400).json({ message: 'Booking creation failed' });
  }
});

// PUT /api/bookings/:id — Update a booking
router.put('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { pickupLocation, destination, status } = req.body;
    if (pickupLocation) booking.pickupLocation = pickupLocation;
    if (destination) booking.destination = destination;
    if (status) booking.status = status;

    const updated = await booking.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Booking update error:', err);
    res.status(400).json({ message: 'Update failed' });
  }
});

// DELETE /api/bookings/:id — Delete a booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await booking.deleteOne();
    res.status(200).json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('❌ Booking deletion error:', err);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

export default router;
// This code defines the booking routes for a VTC application, allowing users to create, read, update, and delete bookings.
