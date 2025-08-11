// utils/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ensure folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = /image\/(png|jpeg|jpg|webp)/.test(file.mimetype);
  cb(ok ? null : new Error('Only png/jpeg/webp allowed'), ok);
};

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});
