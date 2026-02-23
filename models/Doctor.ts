import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  availability: {
    type: String,
    required: true,
    trim: true,
  },
  availableSlots: [{
    type: String,
    required: true,
  }],
  image: {
    type: String,
    default: null,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  education: {
    type: String,
    required: true,
    trim: true,
  },
  about: {
    type: String,
    required: true,
    trim: true,
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

doctorSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

if (mongoose.models.Doctor) {
  delete mongoose.models.Doctor;
}

export const Doctor = mongoose.model('Doctor', doctorSchema);
