import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
const router = express.Router();

// ========== UTILS ==========
const isAdmin = (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return false;
  }
  return true;
};

// GET /admin/users?search=med&page=1&limit=10
router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  };

  try {
    const total = await User.countDocuments(query);
    const users = await User.find(query, 'name email role createdAt isActive')
      .skip(skip)
      .limit(limit)
      .sort({ isActive: -1, createdAt: -1 }); // optional: active users first

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});


// ========== PUT: Update Role ==========
router.put('/users/:id/role', authenticate, authorize(['admin']), async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'driver', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated', user: updated });
  } catch (err) {
    console.error('[PUT] /users/:id/role error:', err);
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
});


// PATCH /admin/users/:id/deactivate
router.patch('/users/:id/deactivate', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot be deactivated' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate user', error: err.message });
  }
});
// ========== DELETE: Permanently Remove User ==========

router.delete('/users/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot be deleted' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});



export default router;
