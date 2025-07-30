import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'driver', 'admin'],
      default: 'user',
    },
profileImage: {
  type: String,
  default: '' // or default to a placeholder image URL
}
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
