import express from 'express';
import Booking from '../models/Booking.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

const VALID_STATUSES = ['pending', 'completed', 'cancelled'];

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
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const pending = bookings.filter(b => !b.status || b.status === 'pending').length;

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
    console.error('❌ Driver bookings error:', err);
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
    const completed = bookings.filter(b => b.status === 'completed').length; // ✅ use completed
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const pending = bookings.filter(b => b.status === 'pending').length;

    res.json({ total, completed, cancelled, pending });
  } catch (err) {
    console.error('❌ Driver stats error:', err);
    res.status(500).json({ message: 'Failed to load driver stats' });
  }
});


// PUT /api/bookings/:id/assign-driver
router.put('/:id/assign-driver', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can assign drivers' });
  }

  const { driverId } = req.body;

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
      status: status ? status.toLowerCase() : 'pending', // 🔑 force lowercase
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
    if (status) booking.status = status.toLowerCase(); // 🔑 always lowercase

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
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'cancelled', 'completed']; // ✅ added completed

    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id).populate(
      'userId assignedDriver',
      'name email role'
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }


    booking.status = status.toLowerCase(); // normalize
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error('❌ Failed to update booking status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// GET /api/bookings/analytics/daily
router.get('/analytics/daily', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    const dailyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(dailyStats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load analytics', error: err.message });
  }
});

export default router;
