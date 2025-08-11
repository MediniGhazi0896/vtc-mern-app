import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import express from 'express';
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/profile';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  }
});

const upload = multer({ storage });

// PUT /api/users/profile-picture
router.put('/users/profile-picture', authenticate, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.profileImage = `/uploads/profile/${req.file.filename}`;
    await user.save();
    res.json({ imagePath: user.profileImage });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

router.patch('/driver/availability', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update availability' });
    }

    const user = await User.findById(req.user.id);
    user.isAvailable = !user.isAvailable;
    await user.save();

    res.json({ isAvailable: user.isAvailable });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

export default router;