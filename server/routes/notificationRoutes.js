// server/routes/notificationRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();
// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// GET notifications for current user
router.get('/', authenticate, async (req, res) => {
  const notifications = await Notification.find({
    $or: [
      { recipient: null }, // global
      { recipient: req.user.id }
    ]
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// POST send notification (admin only)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  const { title, message, recipient } = req.body;

  const notify = new Notification({
    title,
    message,
    recipient: recipient || null
  });

  await notify.save();
  res.status(201).json(notify);
});

// PATCH mark as read
router.patch('/:id/read', authenticate, async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) return res.status(404).json({ message: 'Not found' });
  if (notification.recipient && notification.recipient.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  notification.isRead = true;
  await notification.save();
  res.json(notification);
});

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications' });
  }
});

export default router;
