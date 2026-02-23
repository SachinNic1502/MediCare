import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['patient', 'admin'],
    default: 'patient',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model already exists to avoid recompilation error in Next.js
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = mongoose.model('User', userSchema);
