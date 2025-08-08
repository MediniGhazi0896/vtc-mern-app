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

// GET /api/bookings/stats — Get booking stats 
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userFilter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(userFilter);

    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'Confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const pending = bookings.filter(b => !b.status || b.status === 'Pending').length;

    res.json({ total, completed, cancelled, pending });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats' });
  }
});
// GET /api/bookings/driver — Get bookings assigned to the driver
router.get('/driver', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const bookings = await Booking.find({ assignedDriver: req.user.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bookings' });
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
// GET /api/bookings/driver/stats — stats for assigned bookings
router.get('/driver/stats', authenticate, async (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const bookings = await Booking.find({ assignedDriver: req.user.id });

    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'Confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;

    res.json({ total, completed, cancelled, pending });
  } catch (err) {
    console.error('Driver stats error:', err);
    res.status(500).json({ message: 'Failed to load driver stats' });
  }
});
 

// PUT /api/bookings/:id/assign-driver
router.put('/:id/assign-driver', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can assign drivers' });
  }

  const { driverId } = req.body;

/*   if (!driverId ) {
    return res.status(400).json({ message: 'Missing driverId in request body' });
  } */

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.assignedDriver = driverId || undefined;
    await booking.save();

    const updated = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedDriver', 'name');

    res.json(updated);
  } catch (err) {
    console.error('❌ Driver assignment failed:', err);
    res.status(500).json({ message: 'Driver assignment failed', error: err.message });
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



// PATCH /api/bookings/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;

  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Only drivers can update status' });
  }

  if (!['Confirmed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.assignedDriver || booking.assignedDriver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = status;
    await booking.save();
    res.json({ message: 'Status updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

export default router;
// This code defines the booking routes for a VTC application, allowing users to create, read, update, and delete bookings.
