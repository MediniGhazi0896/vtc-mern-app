// routes/supportRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

/**
 * POST /api/support/tickets
 * Create a ticket: { subject, message }
 */
router.post('/tickets', authenticate, async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ message: 'Subject and message are required' });

  try {
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      subject,
      message,
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket', error: err.message });
  }
});

/**
 * GET /api/support/tickets (optional: list my tickets)
 */
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const tickets = await SupportTicket.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tickets' });
  }
});

export default router;
